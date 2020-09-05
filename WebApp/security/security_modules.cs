using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Nancy.Validation;
using Remota.Services.Shared.Infrastructure.Repository.Interfaces;
using Remota.Shared.Services;
using Remota.WebConfig.Models;
using Remota.WebConfig.Resources;
using System;
using System.Collections.Generic;
using dbModels = Remota.Server.Database.Models;
using System.Linq;
using System.Web;
using Remota.Services.Shared.Domain.Security.Services.Interfaces;
using Remota.Services.Shared.Domain.Users.Services.Interfaces;
using System.Diagnostics;

namespace Remota.WebConfig.Modules
{
    public class SecurityModule : NancyModule
    {
        private readonly ILoggerService _logger;
        private readonly ISecurityService _service;
        private readonly ISecurityService _securityService;
        
        public SecurityModule(ILoggerService logger, ISecurityService service,
                              ISecurityService securityService)
        {
            _logger = logger;
            _service = service;
            _securityService = securityService;

            if (Debugger.IsAttached)
                this.RequiresApiAuthentication();
            else this.RequiresAuthentication();

            Get["/web/security"] = _ =>
            {
                var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                if (!access)
                    return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };

                return View["Security.cshtml", new SecurityResponseModel(_service.GetAll())];
            };

            Get["/api/securities"] = _ =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Context.Request.Headers.Authorization))
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    var securities = _service.GetAll();
                    List<object> result = new List<object>();

                    foreach (var security in securities)
                    {
                        List<object> radios = new List<object>();
                        foreach (var radio in security.RadiosWithAccess)
                        {
                            dynamic radioWithAccess = new
                            {
                                alias = radio.RadioAlias,
                                guid = radio.RadioGuid,
                                access = radio.HasAccess
                            };
                            radios.Add(radioWithAccess);
                        }
                        List<object> reports = new List<object>();
                        foreach (var report in security.ReportsWithAccess)
                        {
                            dynamic reportWithAccess = new
                            {
                                name = report.ReportName,
                                access = report.HasAccess
                            };
                            reports.Add(reportWithAccess);
                        }
                        List<object> properties = new List<object>();
                        foreach (var property in security.Properties)
                        {
                            dynamic propertyWithAccess = new
                            {
                                group = property.Group.ToString(),
                                name = property.Name
                            };
                            properties.Add(propertyWithAccess);
                        }
                        dynamic resultAccessGroup = new
                        {
                            guid = security.Guid,
                            name = security.Name,
                            accessAllRadios = security.AccessAllRadios,
                            radiosWithAccess = radios,
                            accessAllReports = security.AccessAllReports,
                            reportsWithAccess = reports,
                            properties = properties                            
                        };
                        result.Add(resultAccessGroup);
                    }

                    return Response.AsJson(result);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureObtainingSecurities };
                }
            };

            Get["/api/reports"] = (_) =>
            {
                if (Context.Request.Headers.Authorization == null)
                {
                    var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                    if (!access)
                        return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                }

                var reports = _service.GetAllReports();
                List<object> result = new List<object>();
                foreach (var report in reports.OrderBy(item => item.Description))
                {
                    result.Add(new
                    {
                        name = report.ReportName,
                        description = report.Description
                    });
                }
                return Response.AsJson(result);
            };

            Get["/api/security-properties"] = (_) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }
                    var properties = _service.GetAllProperties();
                    var result = new List<object>();
                    foreach (var property in properties.OrderBy(x => x.Description))
                    {
                        result.Add(new
                        {
                            group = property.Group.ToString(),
                            name = property.Name,
                            description = property.Description
                        });
                    }
                    return Response.AsJson(result);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = Resources.WebResources.Error_FailureObtainingSecurityProperties };
                }
            };

            Post["/api/securities/add", true] = async (_, __) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }
                    var model = this.Bind<SecurityModel>(x => x.Guid);
                    var result = this.Validate(model);
                    if (result.IsValid)
                    {
                        await _service.AddAsync(SecurityModelToDbSecurityModel(model));
                        return Response.AsJson(model, HttpStatusCode.OK);

                    }
                    else
                    {
                        return Negotiate.WithAllowedMediaRange("application/json").WithModel(result).WithStatusCode(HttpStatusCode.BadRequest).WithReasonPhrase(WebResources.Error_FailureValidatingItem);
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = Resources.WebResources.Error_FailureSavingSecurity };
                }
            };

            Post["/api/securities/update", true] = async (_, __) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }
                    var model = this.Bind<SecurityModel>();
                    var result = this.Validate(model);

                    if (result.IsValid)
                    {
                        await _service.UpdateAsync(SecurityModelToDbSecurityModel(model)).ConfigureAwait(false);
                        return Response.AsJson(new object(), HttpStatusCode.OK);
                    }
                    else
                    {                     
                        return Negotiate.WithAllowedMediaRange("application/json").WithModel(result).WithStatusCode(HttpStatusCode.BadRequest).WithReasonPhrase(WebResources.Error_FailureValidatingItem);
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = Resources.WebResources.Error_FailureSavingSecurity };
                }
            };

            Post["/api/securities/delete", true] = async (_, __) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ChangeSystemSecurity");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    foreach (var record in this.Bind<IEnumerable<SecurityModel>>())
                    {
                        var result = this.Validate(record);
                        if (result.IsValid)
                        {
                            await _service.DeleteAsync(SecurityModelToDbSecurityModel(record));
                        }
                        else
                        {
                            return Negotiate.WithModel(result).WithStatusCode(HttpStatusCode.BadRequest);
                        }
                    }

                    return Response.AsJson(new object(), HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureDeletingSecurity };
                }
            };

        }

        private dbModels.SecurityModel SecurityModelToDbSecurityModel(SecurityModel model)
        {
            var result = new dbModels.SecurityModel(model.Guid, model.Name, model.AccessAllRadios, model.AccessAllReports);
            foreach (var radio in model.RadiosWithAccess)
            {
                result.RadiosWithAccess.Add(new dbModels.SecurityRadioModel()
                {
                    HasAccess = true,
                    RadioGuid = radio.Guid,
                    RadioAlias = radio.Alias
                });
            }
            foreach (var report in model.ReportsWithAccess)
            {
                result.ReportsWithAccess.Add(new dbModels.SecurityReportModel()
                {
                    ReportName = report.Name,
                    HasAccess = report.Access
                });
            }
            foreach (var property in model.Properties)
            {
                dbModels.SecurityPropertyGroup group;
                Enum.TryParse(property.Group, true, out group);
                result.Properties.Add(new dbModels.SecurityPropertyModel()
                {
                    Group = group,
                    Name = property.Name
                });
            }
            return result;
        }
    }
}