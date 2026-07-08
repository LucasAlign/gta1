using UnityEngine;

namespace GrandTractorAuto.Interaction
{
    public sealed class Interactor : MonoBehaviour
    {
        [SerializeField, Min(0.1f)] private float interactionRadius = 2f;
        [SerializeField] private LayerMask interactionMask = ~0;

        private readonly Collider[] hits = new Collider[16];

        public IInteractable Current { get; private set; }

        private void Update()
        {
            Current = FindBestInteractable();
        }

        public void TryInteract()
        {
            if (Current != null && Current.CanInteract(this))
            {
                Current.Interact(this);
            }
        }

        private IInteractable FindBestInteractable()
        {
            var count = Physics.OverlapSphereNonAlloc(transform.position, interactionRadius, hits, interactionMask);
            IInteractable best = null;
            var bestDistance = float.MaxValue;

            for (var i = 0; i < count; i++)
            {
                if (!hits[i].TryGetComponent<IInteractable>(out var interactable) || !interactable.CanInteract(this))
                {
                    continue;
                }

                var distance = Vector3.SqrMagnitude(interactable.InteractionTransform.position - transform.position);
                if (distance < bestDistance)
                {
                    best = interactable;
                    bestDistance = distance;
                }
            }

            return best;
        }
    }
}
