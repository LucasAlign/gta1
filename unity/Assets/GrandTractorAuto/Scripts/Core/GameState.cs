using System;
using GrandTractorAuto.Data;
using UnityEngine;

namespace GrandTractorAuto.Core
{
    public sealed class GameState : MonoBehaviour
    {
        private readonly SaveService saveService = new();
        private SaveData saveData = new();

        public event Action<int> HelpingStarsChanged;

        public int HelpingStars => saveData.helpingStars;

        private void Awake()
        {
            saveData = saveService.Load();
            HelpingStarsChanged?.Invoke(saveData.helpingStars);
        }

        public void AwardHelpingStars(int amount)
        {
            if (amount <= 0)
            {
                return;
            }

            saveData.helpingStars += amount;
            HelpingStarsChanged?.Invoke(saveData.helpingStars);
            saveService.Save(saveData);
        }

        public void CompleteJob(JobDefinition job)
        {
            if (job == null || saveData.completedJobIds.Contains(job.Id))
            {
                return;
            }

            saveData.completedJobIds.Add(job.Id);
            AwardHelpingStars(job.HelpingStarsReward);
            saveService.Save(saveData);
        }

        public bool IsJobComplete(JobDefinition job)
        {
            return job != null && saveData.completedJobIds.Contains(job.Id);
        }
    }
}
