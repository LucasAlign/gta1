using UnityEngine;
using UnityEngine.Events;

namespace GrandTractorAuto.Interaction
{
    public sealed class SimpleInteractable : MonoBehaviour, IInteractable
    {
        [SerializeField] private string interactionLabel = "Help";
        [SerializeField] private UnityEvent<Interactor> onInteract;

        public string InteractionLabel => interactionLabel;
        public Transform InteractionTransform => transform;

        public bool CanInteract(Interactor interactor)
        {
            return isActiveAndEnabled;
        }

        public void Interact(Interactor interactor)
        {
            onInteract?.Invoke(interactor);
        }
    }
}
