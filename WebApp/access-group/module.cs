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
using MassTransit;

namespace Remota.WebConfig.Modules
{
    public class AccessGroupsModule : NancyModule
    {
        private readonly ILoggerService _logger;
        private readonly IAccessGroupsService _service;
        private readonly ISecurityService _securityService;

        public AccessGroupsModule(ILoggerService logger, IAccessGroupsService service, IUsersService usersService, ISecurityService securityService)

        {
            _logger = logger;
            _service = service;
            _securityService = securityService;

            if (Debugger.IsAttached)
                this.RequiresApiAuthentication();
            else this.RequiresAuthentication();

            Get["/web/access-groups"] = _ =>
            {
                var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeAccessGroups");
                if (!access)
                    return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };

                return View["AccessGroups.cshtml"];
            };

            Get["/api/access-groups"] = _ =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Context.Request.Headers.Authorization))
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeAccessGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    var accessGroups = _service.GetAll().OrderBy(x => x.Name);
                    List<object> result = new List<object>();

                    foreach (var accessGroup in accessGroups)
                    {
                        dynamic resultAccessGroup = new
                        {
                            guid = accessGroup.Guid,
                            name = accessGroup.Name
                        };
                        result.Add(resultAccessGroup);
                    }

                    return Response.AsJson(result);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureObtainingAccessGroups };
                }
            };

            Post["/api/access-groups/add", true] = async (_, __) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeAccessGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    var model = this.Bind<AccessGroupModel>();
                    var result = this.Validate(model);
                    if (result.IsValid)
                    {
                        var dbModel = AccessGroupModelToDbAccessGroupModel(model);
                        dbModel.Guid = Guid.Empty;

                        await _service.AddAsync(dbModel);                        
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

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = Resources.WebResources.Error_FailureSavingAccessGroup };
                }
            };

            Post["/api/access-groups/update", true] = async (_, __) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeAccessGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    var model = this.Bind<AccessGroupModel>();
                    var result = this.Validate(model);

                    if (result.IsValid)
                    {
                        await _service.UpdateAsync(AccessGroupModelToDbAccessGroupModel(model)).ConfigureAwait(false);                        
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

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = Resources.WebResources.Error_FailureSavingAccessGroup };
                }
            };

            Post["/api/access-groups/delete", true] = async (_, __) =>
            {
                try
                {
                    if (Context.Request.Headers.Authorization == null)
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeAccessGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    foreach (var record in this.Bind<IEnumerable<AccessGroupModel>>())
                    {
                        var result = this.Validate(record);
                        if (result.IsValid)
                        {
                            await _service.DeleteAsync(AccessGroupModelToDbAccessGroupModel(record).Guid);
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

                    return Negotiate.WithStatusCode(HttpStatusCode.InternalServerError).WithReasonPhrase(WebResources.Error_FailureDeletingAccessGroup);
                }
            };

        }

        private dbModels.AccessGroupModel AccessGroupModelToDbAccessGroupModel(AccessGroupModel model)
        {
            return new dbModels.AccessGroupModel(model.Guid ?? NewId.NextGuid(), model.Name);
        }
    }
}