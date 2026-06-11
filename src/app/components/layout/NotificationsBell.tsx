import { Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import notificationSoundUrl from "../../../assets/notification.mp3";
import { cashShiftsService } from "../../services/cash-shifts.service";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function NotificationsBell() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [dismissedReqs, setDismissedReqs] = useState<number[]>(() => {
    const saved = localStorage.getItem('dismissedShiftReqs');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const prevReqsRef = useRef<number[]>([]);

  const fetchRequests = async () => {
    try {
      const data = await cashShiftsService.getPendingCloseRequests();
      setPendingRequests(data);

      const newIds = data.map((d: any) => d.id);
      const oldIds = prevReqsRef.current;
      
      const hasNew = newIds.some((id: number) => !oldIds.includes(id));
      // Solo reproducimos sonido si ya habiamos cargado antes (oldIds.length > 0 o si es la primera carga y hay nuevos, depende de si queremos que suene al iniciar)
      // Lo mejor es no sonar al primer render para no asustar al usuario cada que entra a la app, asi que oldIds.length > 0
      if (oldIds.length > 0 && hasNew) {
        const audio = new Audio(notificationSoundUrl);
        audio.play().catch(e => console.log("Audio no pudo reproducirse por políticas del navegador:", e));
      }
      prevReqsRef.current = newIds;
    } catch (error) {
      console.error("Failed to fetch pending requests", error);
    }
  };

  useEffect(() => {
    // Solo si es admin o tiene acceso a Finanzas
    if (user?.role === 'CAJERO') return;

    fetchRequests();
    // Poll every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (user?.role === 'CAJERO') return null;

  const handleDismiss = (id: number) => {
    const newDismissed = [...dismissedReqs, id];
    setDismissedReqs(newDismissed);
    localStorage.setItem('dismissedShiftReqs', JSON.stringify(newDismissed));
  };

  const visibleRequests = pendingRequests.filter(req => !dismissedReqs.includes(req.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative text-[var(--text-main)] bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-all shadow-sm">
          <Bell size={20} className={visibleRequests.length > 0 ? "text-rose-500" : ""} />
          {visibleRequests.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--bg)]"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2 bg-[var(--card)] border border-[var(--border)] shadow-xl" align="end">
        <div className="flex justify-between items-center p-3 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--text-main)] text-sm">Notificaciones</h3>
          {visibleRequests.length > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {visibleRequests.length} nuevas
            </Badge>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {visibleRequests.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-sec)] text-sm">
              <Bell size={32} className="mx-auto mb-2 opacity-20" />
              <p>No tienes notificaciones nuevas</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {visibleRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="p-4 border-b border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
                  onClick={() => {
                    handleDismiss(req.id);
                    navigate('/finance?tab=shifts');
                  }}
                >
                  <p className="text-sm font-bold text-[var(--text-main)] mb-1">
                    Solicitud de Cierre de Caja
                  </p>
                  <p className="text-xs text-[var(--text-sec)]">
                    El cajero <span className="font-bold text-[var(--primary)]">{req.user?.fullName}</span> ha solicitado cerrar su turno.
                  </p>
                  <p className="text-[10px] text-[var(--text-sec)] mt-2 opacity-70">
                    {new Date(req.closeRequestedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
