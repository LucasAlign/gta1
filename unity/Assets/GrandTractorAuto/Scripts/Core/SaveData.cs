using System;
using System.Collections.Generic;

namespace GrandTractorAuto.Core
{
    [Serializable]
    public sealed class SaveData
    {
        public int helpingStars;
        public List<string> completedJobIds = new();
        public List<string> unlockedVehicleIds = new();
        public List<string> harvestedCropIds = new();
    }
}
