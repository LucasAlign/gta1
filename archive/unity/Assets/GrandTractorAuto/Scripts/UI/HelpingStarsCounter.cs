using GrandTractorAuto.Core;
using UnityEngine;
using UnityEngine.Events;

namespace GrandTractorAuto.UI
{
    public sealed class HelpingStarsCounter : MonoBehaviour
    {
        [SerializeField] private GameState gameState;
        [SerializeField] private UnityEvent<string> textChanged;

        private void OnEnable()
        {
            if (gameState != null)
            {
                gameState.HelpingStarsChanged += OnHelpingStarsChanged;
                OnHelpingStarsChanged(gameState.HelpingStars);
            }
        }

        private void OnDisable()
        {
            if (gameState != null)
            {
                gameState.HelpingStarsChanged -= OnHelpingStarsChanged;
            }
        }

        private void OnHelpingStarsChanged(int amount)
        {
            textChanged?.Invoke($"Helping Stars: {amount}");
        }
    }
}
