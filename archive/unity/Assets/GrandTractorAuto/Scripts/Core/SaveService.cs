using System.IO;
using UnityEngine;

namespace GrandTractorAuto.Core
{
    public sealed class SaveService
    {
        private const string FileName = "grand-tractor-auto-save.json";

        private static string SavePath => Path.Combine(Application.persistentDataPath, FileName);

        public SaveData Load()
        {
            if (!File.Exists(SavePath))
            {
                return new SaveData();
            }

            var json = File.ReadAllText(SavePath);
            return JsonUtility.FromJson<SaveData>(json) ?? new SaveData();
        }

        public void Save(SaveData data)
        {
            var json = JsonUtility.ToJson(data, true);
            File.WriteAllText(SavePath, json);
        }
    }
}
