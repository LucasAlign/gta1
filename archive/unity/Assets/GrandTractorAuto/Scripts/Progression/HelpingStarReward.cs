using GrandTractorAuto.Core;
using UnityEngine;

namespace GrandTractorAuto.Progression
{
    public sealed class HelpingStarReward : MonoBehaviour
    {
        [SerializeField] private GameState gameState;
        [SerializeField, Min(0)] private int amount = 1;

        public void Award()
        {
            if (gameState != null)
            {
                gameState.AwardHelpingStars(amount);
            }
        }
    }
}
