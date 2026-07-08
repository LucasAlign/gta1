using UnityEngine;
using UnityEngine.Events;

namespace GrandTractorAuto.UI
{
    public sealed class NarrationText : MonoBehaviour
    {
        [SerializeField] private string fallbackMessage = "Let's help.";
        [SerializeField] private UnityEvent<string> textChanged;

        private void Start()
        {
            Show(fallbackMessage);
        }

        public void Show(string message)
        {
            textChanged?.Invoke(string.IsNullOrWhiteSpace(message) ? fallbackMessage : message);
        }
    }
}
