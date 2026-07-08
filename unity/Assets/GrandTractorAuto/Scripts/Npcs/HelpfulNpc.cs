using GrandTractorAuto.Core;
using GrandTractorAuto.Data;
using GrandTractorAuto.Farming;
using GrandTractorAuto.Interaction;
using UnityEngine;
using UnityEngine.Events;

namespace GrandTractorAuto.Npcs
{
    [RequireComponent(typeof(Collider))]
    public sealed class HelpfulNpc : MonoBehaviour, IInteractable
    {
        [SerializeField] private string characterName = "Neighbor";
        [SerializeField] private JobDefinition job;
        [SerializeField] private CropPlot linkedCropPlot;
        [SerializeField] private GameState gameState;
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private UnityEvent<string> narrationRequested;
        [SerializeField] private UnityEvent jobCompleted;

        private bool hasThankedPlayer;

        public string InteractionLabel => gameState != null && gameState.IsJobComplete(job) ? "Say hi" : $"Talk to {characterName}";
        public Transform InteractionTransform => transform;

        private void OnEnable()
        {
            if (linkedCropPlot != null)
            {
                linkedCropPlot.Harvested += OnCropHarvested;
            }
        }

        private void OnDisable()
        {
            if (linkedCropPlot != null)
            {
                linkedCropPlot.Harvested -= OnCropHarvested;
            }
        }

        public bool CanInteract(Interactor interactor)
        {
            return job != null && isActiveAndEnabled;
        }

        public void Interact(Interactor interactor)
        {
            Speak(job != null ? job.NarrationPrompt : "Let's help today.");
        }

        private void OnCropHarvested(CropDefinition crop)
        {
            if (hasThankedPlayer || job == null || gameState == null)
            {
                return;
            }

            hasThankedPlayer = true;
            Speak("Thank you for helping the garden grow.");
            gameState.CompleteJob(job);
            jobCompleted?.Invoke();
        }

        private void Speak(string message)
        {
            if (job != null && job.NarrationClip != null && audioSource != null)
            {
                audioSource.PlayOneShot(job.NarrationClip);
            }

            narrationRequested?.Invoke(message);
        }
    }
}
