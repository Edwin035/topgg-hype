import { forwardRef, useState } from "react"; // Hooks y utilidades de React
import type { ComponentPropsWithoutRef } from "react"; // Tipado para props sin ref
import type { SelectProps } from "@mantine/core"; // Tipado de Mantine Select
import { Group, Text, Select } from "@mantine/core"; // Componentes de UI de Mantine

// Tipo de datos que representa un país
type Country = { iso2: string; name: string; dial: string };

// Prefijo por defecto global, usado si no se proporciona valor
export const DEFAULT_DIAL = "+57";

// Función para obtener la URL de la bandera a partir del código ISO2
function flagUrl(iso2: string) {
  return `https://flagcdn.com/${iso2.toLowerCase()}.svg`;
}

// Componente para mostrar la bandera de un país
function Flag({ iso2 }: { iso2: string }) {
  const [broken, setBroken] = useState(false); // Estado para manejar si la imagen falla
  if (broken) {
    // Si la imagen falla, mostrar un fallback con el código ISO
    return (
      <div
        style={{
          width: 22,
          height: 16,
          borderRadius: 2,
          background: "rgb(8, 12, 22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 700,
          color: "white",
        }}
        aria-label={iso2.toUpperCase()}>
        {iso2.toUpperCase()}
      </div>
    );
  }
  // Mostrar imagen de bandera normalmente
  return (
    <img
      src={flagUrl(iso2)}
      width={22}
      height={16}
      loading="lazy"
      alt={iso2.toUpperCase()}
      style={{ display: "block", borderRadius: 2 }}
      onError={() => setBroken(true)} // Si falla la carga, activar fallback
    />
  );
}

// Lista completa de países con código ISO2, nombre y prefijo telefónico
export const COUNTRIES: Country[] = [
  // América
  { iso2: "US", name: "Estados Unidos", dial: "+1" },
  { iso2: "CA", name: "Canadá", dial: "+1" },
  { iso2: "MX", name: "México", dial: "+52" },
  { iso2: "AR", name: "Argentina", dial: "+54" },
  { iso2: "BO", name: "Bolivia", dial: "+591" },
  { iso2: "BR", name: "Brasil", dial: "+55" },
  { iso2: "CL", name: "Chile", dial: "+56" },
  { iso2: "CO", name: "Colombia", dial: "+57" },
  { iso2: "CR", name: "Costa Rica", dial: "+506" },
  { iso2: "CU", name: "Cuba", dial: "+53" },
  { iso2: "DO", name: "República Dominicana", dial: "+1" },
  { iso2: "EC", name: "Ecuador", dial: "+593" },
  { iso2: "GT", name: "Guatemala", dial: "+502" },
  { iso2: "HN", name: "Honduras", dial: "+504" },
  { iso2: "NI", name: "Nicaragua", dial: "+505" },
  { iso2: "PA", name: "Panamá", dial: "+507" },
  { iso2: "PE", name: "Perú", dial: "+51" },
  { iso2: "PR", name: "Puerto Rico", dial: "+1" },
  { iso2: "PY", name: "Paraguay", dial: "+595" },
  { iso2: "SV", name: "El Salvador", dial: "+503" },
  { iso2: "UY", name: "Uruguay", dial: "+598" },
  { iso2: "VE", name: "Venezuela", dial: "+58" },

  // Europa
  { iso2: "ES", name: "España", dial: "+34" },
  { iso2: "PT", name: "Portugal", dial: "+351" },
  { iso2: "FR", name: "Francia", dial: "+33" },
  { iso2: "DE", name: "Alemania", dial: "+49" },
  { iso2: "IT", name: "Italia", dial: "+39" },
  { iso2: "GB", name: "Reino Unido", dial: "+44" },
  { iso2: "IE", name: "Irlanda", dial: "+353" },
  { iso2: "NL", name: "Países Bajos", dial: "+31" },
  { iso2: "BE", name: "Bélgica", dial: "+32" },
  { iso2: "SE", name: "Suecia", dial: "+46" },
  { iso2: "NO", name: "Noruega", dial: "+47" },
  { iso2: "DK", name: "Dinamarca", dial: "+45" },
  { iso2: "FI", name: "Finlandia", dial: "+358" },
  { iso2: "CH", name: "Suiza", dial: "+41" },
  { iso2: "AT", name: "Austria", dial: "+43" },
  { iso2: "GR", name: "Grecia", dial: "+30" },
  { iso2: "PL", name: "Polonia", dial: "+48" },
  { iso2: "CZ", name: "Chequia", dial: "+420" },
  { iso2: "RO", name: "Rumanía", dial: "+40" },
  { iso2: "HU", name: "Hungría", dial: "+36" },
  { iso2: "UA", name: "Ucrania", dial: "+380" },
  { iso2: "RU", name: "Rusia", dial: "+7" },
  { iso2: "IS", name: "Islandia", dial: "+354" },

  // África
  { iso2: "MA", name: "Marruecos", dial: "+212" },
  { iso2: "DZ", name: "Argelia", dial: "+213" },
  { iso2: "TN", name: "Túnez", dial: "+216" },
  { iso2: "EG", name: "Egipto", dial: "+20" },
  { iso2: "ZA", name: "Sudáfrica", dial: "+27" },
  { iso2: "NG", name: "Nigeria", dial: "+234" },
  { iso2: "KE", name: "Kenia", dial: "+254" },
  { iso2: "GH", name: "Ghana", dial: "+233" },
  { iso2: "ET", name: "Etiopía", dial: "+251" },
  { iso2: "CI", name: "Costa de Marfil", dial: "+225" },
  { iso2: "SN", name: "Senegal", dial: "+221" },

  // Asia y Oceanía
  { iso2: "CN", name: "China", dial: "+86" },
  { iso2: "JP", name: "Japón", dial: "+81" },
  { iso2: "KR", name: "Corea del Sur", dial: "+82" },
  { iso2: "IN", name: "India", dial: "+91" },
  { iso2: "ID", name: "Indonesia", dial: "+62" },
  { iso2: "PH", name: "Filipinas", dial: "+63" },
  { iso2: "SG", name: "Singapur", dial: "+65" },
  { iso2: "MY", name: "Malasia", dial: "+60" },
  { iso2: "TH", name: "Tailandia", dial: "+66" },
  { iso2: "VN", name: "Vietnam", dial: "+84" },
  { iso2: "AE", name: "Emiratos Árabes Unidos", dial: "+971" },
  { iso2: "SA", name: "Arabia Saudita", dial: "+966" },
  { iso2: "TR", name: "Turquía", dial: "+90" },
  { iso2: "IL", name: "Israel", dial: "+972" },
  { iso2: "AU", name: "Australia", dial: "+61" },
  { iso2: "NZ", name: "Nueva Zelanda", dial: "+64" },
];

// Props de cada elemento de país en el Select
interface ItemProps extends ComponentPropsWithoutRef<"div"> {
  label: string; // Prefijo para mostrar
  description?: string; // Nombre del país
  iso2: string; // Código ISO para bandera
  dial: string; // Prefijo telefónico
}

// Componente personalizado para mostrar cada país con su bandera y nombre
const CountryItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, description, iso2, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Flag iso2={iso2} /> {/* Bandera */}
        <div>
          <Text size="sm" fw={600}>
            {label} {/* Prefijo */}
          </Text>
          {description && (
            <Text size="xs" opacity={0.65}>
              {description}
            </Text>
          )}{" "}
          {/* Nombre país opcional */}
        </div>
      </Group>
    </div>
  ),
);
CountryItem.displayName = "CountryItem";

// Props del Select de prefijo, extendiendo Mantine Select sin 'data' ni 'itemComponent'
type CountryPrefixSelectProps = Omit<SelectProps, "data" | "itemComponent"> & {
  value?: string; // Prefijo seleccionado
  onChange?: (dial: string | null) => void; // Callback al cambiar
};

// Componente principal del Select de prefijos
export default function CountryPrefixSelect({
  value,
  onChange,
  ...rest
}: CountryPrefixSelectProps) {
  // Transformar lista de países en formato compatible con Mantine Select
  const data = COUNTRIES.map((c) => ({
    value: c.dial,
    label: c.dial,
    description: c.name,
    iso2: c.iso2,
    dial: c.dial,
  }));

  const effectiveValue = value ?? DEFAULT_DIAL; // Valor efectivo: prop o default
  const selected = COUNTRIES.find((c) => c.dial === effectiveValue); // País seleccionado
  const left = selected ? <Flag iso2={selected.iso2} /> : undefined; // Icono bandera a la izquierda

  return (
    <Select
      searchable
      nothingFound="Sin resultados"
      maxDropdownHeight={420}
      itemComponent={CountryItem as any}
      data={data as any}
      value={effectiveValue}
      onChange={(v) => onChange?.(v ?? DEFAULT_DIAL)}
      icon={left}
      placeholder="Prefijo"
      filter={(query, item) => {
        const q = query.toLowerCase().trim();
        return (
          item.label?.toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q)
        );
      }}
      styles={{
        input: {
          height: 40,
          background: "hsl(var(--background))",
          borderRadius: "0.675rem",
          color: "hsl(var(--foreground))",
          fontSize: "0.875rem",
          paddingLeft: "2.5rem",
          border: "1px solid hsl(var(--input))",
        },
        dropdown: {
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--input))",
          color: "hsl(var(--foreground))",
        },
        item: {
          color: "hsl(var(--foreground))",
          "&[data-hovered]": {
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--foreground))",
          },
        },
      }}
    />
  );
}
