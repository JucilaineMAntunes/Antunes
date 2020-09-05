using FluentValidation;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Nancy.Validation;
using Remota.Services.Shared.Domain.Settings.Services.Interfaces;
using Remota.Shared.Services;
using Remota.WebConfig.Models;
using Remota.WebConfig.Resources;
using System;
using System.Linq;
using Remota.Network;
using Remota.Services.Shared.Infrastructure.Repository.Interfaces;
using System.Collections.Generic;
using Remota.Database.Models.Settings;

namespace Remota.WebConfig.Modules
{
    public class IntegrationsSettingsModule : NancyModule
    {
        private readonly ILoggerService _logger;
        private readonly IIntegrationsSettingsService _settingsService;
        
        public IntegrationsSettingsModule(ILoggerService logger, IIntegrationsSettingsService settingsService)
        {
            this.RequiresAuthentication();

            _logger = logger;
            _settingsService = settingsService;            

            Get["/web/integrations"] = _ =>
            {
                try
                {
                    return View["IntegrationsSettings.cshtml", new IntegrationsSettingsResponseModel(_settingsService.Repository.GetSettings().ToList())];
                }
                catch (Exception e)
                {
                    _logger.LogError(e);
                    return Negotiate.WithModel(new object()).WithStatusCode(HttpStatusCode.InternalServerError).WithReasonPhrase(WebResources.Error_FailureObtainingSettings);
                }
            };

            /*
             
            Get["/api/users/{id}/security-properties/groups/{group}/properties/{name}"] = parameters =>
            {

                try
                {
                    var user = _usersService.Find(x => x.Guid == parameters.id);
                    var properties = _securityRepository.Find(x => x.Guid == user.SecurityGuid).Properties;

                    var result = properties.Find(x => x.Group.ToString().ToUpper() == parameters.group.ToString().ToUpper() && x.Name.ToUpper() == parameters.name.ToString().ToUpper());

                    return Response.AsJson(result);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);
                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureObtainingUsers };
                }

            };
             */

            Get["/api/integrations/{type}/{setting}"] = parameters =>
            {
                try
                {                                       

                    var integrations = _settingsService.Find(x => x.IntegrationType.ToString().ToLower() == ((string)parameters.type).ToLower() 
                        && x.SettingKey.ToLower() == ((string)parameters.setting).ToLower());   //Network.IntegrationTypes.Csta                 

                    //var result = integrations.SettingKey == parameters.setting; // .Where(x => x.SettingKey.ToString() == setting.i.CompareTx.Group.ToString().ToUpper() == parameters.group.ToString().ToUpper() && x.Name.ToUpper() == parameters.name.ToString().ToUpper());

                    return Response.AsJson(integrations);

                }

                catch (Exception ex)
                {
                    _logger.LogError(ex);
                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureObtainingSettings };
                }
            };
           

            Post["/web/integrations", true] = async (_, __) =>
            {
                try
                {
                    var model = this.Bind<IntegrationsSettingsRequestModel>();
                    var result = this.Validate(model);
                    if (result.IsValid)
                    {
                        await _settingsService.SaveSettings(this.Bind<Services.Shared.Domain.Settings.Models.IntegrationsSettingsModel>());
                        return View["IntegrationsSettings.cshtml", new IntegrationsSettingsResponseModel(_settingsService.Repository.GetSettings().ToList())];
                    }
                    else
                    {
                        return View["IntegrationsSettings.cshtml", new IntegrationsSettingsResponseModel(_settingsService.Repository.GetSettings().ToList())
                        {
                            Alert = new AlertModel
                            {
                                Level = AlertLevel.Error,
                                Title = WebResources.Error,
                                Messages = new[] { WebResources.Error_FailureValidatingItem }
                            }
                        }];
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e);

                    return new Response { StatusCode = HttpStatusCode.InternalServerError, ReasonPhrase = WebResources.Error_FailureSavingSettings };
                }
            };
        }
    }
}