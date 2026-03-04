import EcoBubble from "./EcoBubble";
import { useCarbonEngine } from "./useCarbonEngine";

export default function App() {
  useCarbonEngine();
  return <EcoBubble />;
}
