
import {
  useCallback,
  useState,
} from "react";

import {
  COMPONENT_IDS,
  COMPONENT_INFO,
} from "../config/consoleLayout.js";

export function useComponentSelection() {
  const [selectedId, setSelectedId] = useState(
    COMPONENT_IDS.MASTER
  );

  const selectComponent = useCallback((id) => {
    if (COMPONENT_INFO[id]) {
      setSelectedId(id);
    }
  }, []);

  return {
    selectedId,
    selectComponent,
    selectedComponent:
      COMPONENT_INFO[selectedId],
  };
}
