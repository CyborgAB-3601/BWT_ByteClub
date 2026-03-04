import React from 'react';
import ReactDOM from 'react-dom/client';
import { EcoBubble } from './components/extension/EcoBubble';
import { MiniControlPanel } from './components/extension/MiniControlPanel';
import css from './index.css?inline';

const ContentApp = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [alertState, setAlertState] = React.useState<'normal' | 'heat' | 'cold' | 'daylight'>('normal');
  const [isVisible, setIsVisible] = React.useState(true);

  // Load visibility preference
  React.useEffect(() => {
    // Default to true
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['showBubble'], (result) => {
        console.log('EcoSense: Loaded visibility preference:', result.showBubble);
        if (result.showBubble !== undefined) {
          setIsVisible(Boolean(result.showBubble));
        }
      });

      // Listen for changes
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.showBubble) {
          console.log('EcoSense: Visibility changed to:', changes.showBubble.newValue);
          setIsVisible(Boolean(changes.showBubble.newValue));
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    } else {
        // Fallback for local testing (won't work across tabs without storage event but good for debugging)
        const stored = localStorage.getItem('ecosense_showBubble');
        if (stored !== null) setIsVisible(stored === 'true');
    }
  }, []);

  // Demo: Cycle alert states every 10 seconds (REMOVED)
  // We now rely on real-time intensity detection in EcoBubble
  // React.useEffect(() => {
  //   const states: ('normal' | 'heat' | 'cold' | 'daylight')[] = ['normal', 'heat', 'cold', 'daylight'];
  //   let i = 0;
  //   const interval = setInterval(() => {
  //     i = (i + 1) % states.length;
  //     setAlertState(states[i]);
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  // Sync state across tabs
  React.useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // Initial load
      chrome.storage.local.get(['bubbleState'], (result) => {
        if (result.bubbleState) {
          setIsOpen((result.bubbleState as { isOpen: boolean }).isOpen);
        }
      });

      // Listen for changes
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.bubbleState) {
          setIsOpen((changes.bubbleState.newValue as { isOpen: boolean }).isOpen);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  const toggleOpen = (open: boolean) => {
    setIsOpen(open);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ bubbleState: { isOpen: open } });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="font-sans text-text-hi" id="ecosense-shadow-app">
      {css ? <style>{css}</style> : <div style={{ display: 'none' }}>CSS NOT LOADED</div>}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 2147483647, pointerEvents: 'none', width: '100vw', height: '100vh', overflow: 'visible' }}>
        <EcoBubble 
          onClick={() => toggleOpen(true)} 
          isOpen={isOpen} 
          alertState={alertState} 
        />
        <div className="fixed top-4 right-4 z-[2147483647] pointer-events-auto">
             <MiniControlPanel 
               isOpen={isOpen}
               onClose={() => toggleOpen(false)} 
               onMinimize={() => toggleOpen(false)}
             />
        </div>
      </div>
    </div>
  );
};

// Create a container for the Shadow DOM
const root = document.createElement('div');
root.id = 'ecosense-root';
// Make root full size but let events pass through
root.style.position = 'fixed';
root.style.top = '0';
root.style.left = '0';
root.style.width = '100vw';
root.style.height = '100vh';
root.style.zIndex = '2147483647';
root.style.pointerEvents = 'none';

// Ensure we don't duplicate the root
if (!document.getElementById('ecosense-root')) {
  // Use body instead of documentElement for better compatibility
  document.body.appendChild(root);
  console.log('EcoSense content script loaded (v2)');
  
  const shadowRoot = root.attachShadow({ mode: 'open' });
  const shadowContainer = document.createElement('div');
  shadowContainer.id = 'ecosense-shadow-container';
  shadowRoot.appendChild(shadowContainer);
  
  ReactDOM.createRoot(shadowContainer).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );
}
