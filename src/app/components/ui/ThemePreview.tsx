import { ColorPalette } from '../../utils/colorUtils';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Search,
  Moon,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ThemePreviewProps {
  colors: ColorPalette;
  label?: string;
  compact?: boolean;
}

export function ThemePreview({ colors, label, compact = false }: ThemePreviewProps) {
  const height = compact ? '220px' : '340px';

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        display: 'flex',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: compact ? '8px' : '11px',
        boxShadow: `0 4px 12px ${colors.shadow}`,
      }}
    >
      {/* Mini Sidebar */}
      <div
        style={{
          width: compact ? '50px' : '70px',
          backgroundColor: colors.sidebar,
          borderRight: `1px solid ${colors.border}`,
          padding: compact ? '8px 4px' : '12px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? '4px' : '6px',
        }}
      >
        {/* Logo area */}
        <div
          style={{
            width: compact ? '20px' : '28px',
            height: compact ? '20px' : '28px',
            borderRadius: '6px',
            backgroundColor: colors.accent,
            margin: '0 auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#fff', fontSize: compact ? '10px' : '14px', fontWeight: 700 }}>A</span>
        </div>

        {/* Nav items */}
        {[LayoutDashboard, ShoppingCart, Package, Users, Settings].map((Icon, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: compact ? '3px 4px' : '4px 6px',
              borderRadius: '4px',
              backgroundColor: i === 0 ? colors.bg : 'transparent',
              color: i === 0 ? colors.accent : colors.textSec,
            }}
          >
            <Icon size={compact ? 10 : 13} />
            {!compact && (
              <span style={{ fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {['Panel', 'Ventas', 'Stock', 'Clientes', 'Config'][i]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Mini Header */}
        <div
          style={{
            backgroundColor: colors.card,
            borderBottom: `1px solid ${colors.border}`,
            padding: compact ? '6px 8px' : '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${colors.border}`,
              color: colors.textSec,
            }}
          >
            <Search size={compact ? 8 : 10} />
            <span style={{ fontSize: compact ? '7px' : '8px' }}>Buscar...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: colors.accent,
                color: '#fff',
                fontSize: compact ? '7px' : '8px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Moon size={compact ? 7 : 8} />
              <span>Tema</span>
            </div>
            <div
              style={{
                fontSize: compact ? '7px' : '8px',
                textAlign: 'right',
                color: colors.textMain,
                fontWeight: 600,
              }}
            >
              Admin
            </div>
          </div>
        </div>

        {/* Content area */}
        <div style={{ padding: compact ? '6px' : '10px', flex: 1, overflow: 'hidden' }}>
          {label && (
            <div
              style={{
                color: colors.textMain,
                fontWeight: 700,
                fontSize: compact ? '9px' : '12px',
                marginBottom: compact ? '4px' : '6px',
              }}
            >
              {label}
            </div>
          )}

          {/* Stat cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: compact ? '4px' : '6px',
              marginBottom: compact ? '6px' : '8px',
            }}
          >
            {[
              { label: 'Ventas', value: '$12,340', icon: TrendingUp, iconColor: colors.accent },
              { label: 'Pedidos', value: '23', icon: ShoppingCart, iconColor: colors.primary },
              ...(compact ? [] : [{ label: 'Clientes', value: '156', icon: Users, iconColor: colors.accent }]),
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: compact ? '5px' : '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px',
                  }}
                >
                  <span style={{ color: colors.textSec, fontSize: compact ? '6px' : '8px' }}>
                    {stat.label}
                  </span>
                  <stat.icon size={compact ? 8 : 10} color={stat.iconColor} />
                </div>
                <div
                  style={{
                    color: colors.textMain,
                    fontWeight: 700,
                    fontSize: compact ? '10px' : '13px',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Alert examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '3px' : '4px' }}>
            <div
              style={{
                backgroundColor: colors.successBg,
                color: colors.successText,
                borderRadius: '4px',
                padding: compact ? '3px 5px' : '4px 8px',
                fontSize: compact ? '7px' : '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={compact ? 8 : 10} />
              Operación exitosa
            </div>
            <div
              style={{
                backgroundColor: colors.warningBg,
                color: colors.warningText,
                borderRadius: '4px',
                padding: compact ? '3px 5px' : '4px 8px',
                fontSize: compact ? '7px' : '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertTriangle size={compact ? 8 : 10} />
              Stock bajo en 5 productos
            </div>
            <div
              style={{
                backgroundColor: colors.errorBg,
                color: colors.errorText,
                borderRadius: '4px',
                padding: compact ? '3px 5px' : '4px 8px',
                fontSize: compact ? '7px' : '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertCircle size={compact ? 8 : 10} />
              Error en procesamiento
            </div>
          </div>

          {/* Button samples */}
          {!compact && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <div
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  backgroundColor: colors.accent,
                  color: '#fff',
                  fontSize: '8px',
                  fontWeight: 600,
                }}
              >
                Guardar
              </div>
              <div
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  backgroundColor: colors.primary,
                  color: '#fff',
                  fontSize: '8px',
                  fontWeight: 600,
                }}
              >
                Editar
              </div>
              <div
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.textMain,
                  fontSize: '8px',
                  fontWeight: 600,
                }}
              >
                Cancelar
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Componente de muestra compacta de colores (para temas guardados) ----
export function ColorSwatches({ colors, size = 20 }: { colors: ColorPalette; size?: number }) {
  const swatches = [colors.bg, colors.sidebar, colors.primary, colors.accent, colors.textMain, colors.border];
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {swatches.map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            border: '1.5px solid rgba(128,128,128,0.3)',
          }}
        />
      ))}
    </div>
  );
}
