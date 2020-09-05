using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Nancy.Validation;
using Remota.Shared.Services;
using Remota.WebConfig.Models;
using Remota.WebConfig.Resources;
using System;
using System.Collections.Generic;
using dbModels = Remota.Server.Database.Models.Groups;
using Remota.Services.Shared.Domain.FleetManagement.Services.Interfaces;
using Remota.Services.Shared.Infrastructure.Repository.Interfaces;
using Remota.Services.Shared.Domain.Security.Services.Interfaces;
using Microsoft.AspNet.SignalR.Infrastructure;
using System.Diagnostics;

namespace Remota.WebConfig.Modules
{
    public class GroupsModule : NancyModule
    {
        private readonly ILoggerService _logger;
        private readonly IGroupsService _service;
        private readonly IStationsRepository _stationsRepository;
        private readonly ISecurityService _securityService;
        private readonly IConnectionManager _signalR;

        public GroupsModule(ILoggerService logger, IGroupsService service, IStationsRepository stationsRepository, ISecurityService securityService,

            IConnectionManager signalR


            )
        {
            _logger = logger;
            _service = service;
            _stationsRepository = stationsRepository;
            _securityService = securityService;
            _signalR = signalR;

            if (Debugger.IsAttached)
                this.RequiresApiAuthentication();
            else this.RequiresAuthentication();

            Get["/web/groups"] = _ =>
            {
                var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeGroups");
                if (!access)
                    return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };


                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("2d42263c463a43d396806673c03b3e9d", "N"));
                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("d56025ce863b4d8c9eadda06c1460535", "N"));
                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("57228cfcdc1440ae82062953c3a0d792", "N"));
                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("7286b28b7f9747cfb6da8ca3cf599161", "N"));
                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("a0deb9e657224eb786b6ad9c4e02f9ac", "N"));
                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("421362042c3c4d5ab7aac2ef36292900", "N"));
                //Hubs.RadioNetworksStatusHub.SetStationOnline(_signalR, Guid.ParseExact("d105d8941a3e4bc1939585bfd1971af3", "N"));                
                //Hubs.RadioNetworksStatusHub.SetStationOffline(_signalR, Guid.ParseExact("ebdee74feda74ad19f7f11b1463297b1", "N"));

                return View["Groups.cshtml", new GroupResponseModel(_service.GetAll())];
            };

            Get["/api/groups"] = _ =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Context.Request.Headers.Authorization))
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }
                    var groups = _service.GetAll();
                    List<object> result = new List<object>();

                    foreach (var group in groups)
                    {
                        var radio = _stationsRepository.Find(x => x.Guid == group.RadioGuid);

                        dynamic resultGroup = new
                        {
                            guid = group.Guid,
                            radioGuid = radio?.Guid,
                            radioAlias = radio?.Alias,
                            alias = group.Alias
                        };
                        result.Add(resultGroup);
                    }

                    return Response.AsJson(result);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureObtainingGroups };
                }
            };

            Post["/api/groups/add", true] = async (_, __) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Context.Request.Headers.Authorization))
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    var model = this.Bind<GroupModel>(x => x.Guid);
                    var result = this.Validate(model);
                    if (result.IsValid)
                    {
                        await _service.AddAsync(GroupModelToDbGroupModel(model));                        
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

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureSavingGroup };
                }
            };

            Post["/api/groups/update", true] = async (_, __) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Context.Request.Headers.Authorization))
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    var model = this.Bind<GroupModel>();
                    var result = this.Validate(model);

                    if (result.IsValid)
                    {
                        await _service.UpdateAsync(GroupModelToDbGroupModel(model)).ConfigureAwait(false);
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

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureSavingGroup };
                }
            };

            Post["/api/groups/delete", true] = async (_, __) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Context.Request.Headers.Authorization))
                    {
                        var access = _securityService.CheckUserAccess(((UserIdentity)Context.CurrentUser).Guid, "ViewOrChangeGroups");
                        if (!access)
                            return new Response { StatusCode = HttpStatusCode.Forbidden, ReasonPhrase = WebResources.Error_PermissionDenied };
                    }

                    foreach (var record in this.Bind<IEnumerable<GroupModel>>())
                    {
                        var result = this.Validate(record);
                        if (result.IsValid)
                        {
                            await _service.DeleteAsync(GroupModelToDbGroupModel(record));
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

                    return Negotiate.WithStatusCode(HttpStatusCode.InternalServerError).WithReasonPhrase(WebResources.Error_FailureDeletingGroup);
                }
            };

        }

        private dbModels.GroupModel GroupModelToDbGroupModel(GroupModel model)
        {
            return new dbModels.GroupModel
            {
                Guid = model.Guid ?? Guid.Empty,
                RadioGuid = model.RadioGuid ?? Guid.Empty,
                Alias = model.Alias
            };
        }
    }
}