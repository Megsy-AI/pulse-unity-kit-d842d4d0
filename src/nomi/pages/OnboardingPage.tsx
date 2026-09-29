import { useNavigate } from "react-router-dom";
import { CharacterCustomizer } from "../components/CharacterCustomizer";
import { useNomi } from "../store";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateCompanion } = useNomi();

  const finish = () => {
    updateCompanion({ onboarded: true });
    navigate("/chat", { replace: true });
  };

  return <CharacterCustomizer onDone={finish} />;
}