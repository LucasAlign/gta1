using UnityEngine;

namespace GrandTractorAuto.Interaction
{
    public interface IInteractable
    {
        string InteractionLabel { get; }
        Transform InteractionTransform { get; }
        bool CanInteract(Interactor interactor);
        void Interact(Interactor interactor);
    }
}
