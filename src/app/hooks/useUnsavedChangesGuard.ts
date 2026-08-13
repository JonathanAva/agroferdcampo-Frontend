import { useCallback, useEffect, useState } from "react";
import { useBlocker, type BlockerFunction } from "react-router";

/**
 * Protege formularios de creación/edición contra pérdida accidental de datos:
 * - Bloquea navegación dentro de la app (sidebar, botón atrás) mientras haya cambios sin guardar.
 * - Bloquea cierre/recarga de la pestaña del navegador (beforeunload).
 * - Expone `confirmExit` para envolver acciones que cierran modales (botón Cancelar, la X, click fuera).
 *
 * Uso:
 *   const { confirmExit, isOpen, handleConfirm, handleCancel } = useUnsavedChangesGuard(isDirty);
 *   <Dialog open={open} onOpenChange={(o) => !o && confirmExit(() => setOpen(false))}>
 *   <UnsavedChangesDialog open={isOpen} onConfirm={handleConfirm} onCancel={handleCancel} />
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const blocker = useBlocker(
    useCallback<BlockerFunction>(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  /** Envuelve una acción que descartaría cambios (cerrar modal, navegar). Si no hay cambios, la ejecuta directo. */
  const confirmExit = useCallback((action: () => void) => {
    if (!isDirty) {
      action();
      return;
    }
    setPendingAction(() => action);
  }, [isDirty]);

  const handleConfirm = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    pendingAction?.();
    setPendingAction(null);
  }, [blocker, pendingAction]);

  const handleCancel = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setPendingAction(null);
  }, [blocker]);

  const isOpen = blocker.state === "blocked" || pendingAction !== null;

  return { confirmExit, isOpen, handleConfirm, handleCancel };
}
