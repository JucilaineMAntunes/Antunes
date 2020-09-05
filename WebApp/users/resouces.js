using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.Dynamic;
using System.IO;
using System.Linq;
using Nancy;
using Newtonsoft.Json.Linq;
using Remota.Services.Shared.Domain.Settings.Services.Interfaces;
using Remota.Shared;
using Remota.Shared.Services;
using Remota.WebConfig.Resources;

namespace Remota.WebConfig.Modules
{
    public class ResourcesModule : NancyModule
    {
        ILoggerService _logger;
        IAppSettings _appSettings;

        private static Dictionary<string, object> _resources;

        public ResourcesModule(ILoggerService logger, IAppSettings appSettings)
        {
            _logger = logger;
            _appSettings = appSettings;

            Get["/api/resources/resources.json"] = _ =>
            {
                try
                {
                    var resources = GetResources();

                    var result = new JObject(resources.Where(x => x.Key != "DataTableJson").Select(x => new JProperty(x.Key, x.Value)));
                    result.Merge(JObject.Parse((string)resources["DataTableJson"]));

                    return Response.AsText(result.ToString(), "application/json");
                }
                catch (Exception e)
                {
                    _logger.LogError(e);
                    return Negotiate.WithModel(new object()).WithStatusCode(HttpStatusCode.InternalServerError).WithReasonPhrase(WebResources.Error_FailureObtainingResources);
                }
            };

            Get["/api/resources/translations/{key}"] = parameters =>
            {
                try
                {
                    var resources = GetResources();
                    var search = (string)parameters.key;
                    var item = resources.FirstOrDefault(resource => resource.Key.ToLower() == search.ToLower());

                    var translation = string.Empty;

                    if (!string.IsNullOrWhiteSpace(item.Value as string))
                    {
                        translation = (string)item.Value;
                    }
                    else
                    {
                        translation = WebResources.NotFound;
                    }

                    return Response.AsJson(new { search, translation }, HttpStatusCode.OK);

                }
                catch (Exception e)
                {
                    _logger.LogError(e);
                    return Negotiate.WithModel(new object()).WithStatusCode(HttpStatusCode.InternalServerError).WithReasonPhrase(WebResources.Error_FailureObtainingTranslation);
                }
            };

            Get["/api/resources/currentLanguage"] = _ =>
            {
                try
                {
                    var resources = GetResources();
                    var currentLanguage = _appSettings.Language;
                    return Response.AsJson(new { currentLanguage, resources }, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    _logger.LogError(e);
                    return Response.AsJson(e, HttpStatusCode.InternalServerError);
                }
            };

            Get["/api/resources/defaultUserImage"] = _ =>
            {
                try
                {
                    var stream = new MemoryStream();
                    Resources.WebResources.UserProfile.Save(stream, ImageFormat.Png);
                    stream.Seek(0, SeekOrigin.Begin);
                    var buffer = new byte[stream.Length];
                    stream.Read(buffer, 0, (int)stream.Length);

                    //return Response.FromStream(stream, "data:image/png;base64," + Convert.ToBase64String(buffer));

                    return Response.AsText("data:image/png;base64," + Convert.ToBase64String(buffer), "data:image/png;base64");
                }
                catch (Exception e)
                {
                    _logger.LogError(e);
                    return Response.AsJson(e, HttpStatusCode.InternalServerError);
                }
            };

        }

        private bool template(string a, string b) => true;

        private Dictionary<string, object> GetResources()
        {
            if (_resources == null)
            {
                _resources = WebResources
                            .ResourceManager
                            .GetResourceSet(Context.Culture, true, true)
                            .Cast<DictionaryEntry>()
                            .Where(x => x.Value is string)
                            .ToDictionary(x => (string)x.Key, x => x.Value);
            }
            return _resources;
        }
    }
}
