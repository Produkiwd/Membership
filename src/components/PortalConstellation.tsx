// Geometry shared with Sinautech/src/components/TechAmbient.tsx.
export default function PortalConstellation() {
  return (
    <svg aria-hidden="true" className="portal-constellation absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 720 560" preserveAspectRatio="xMidYMid slice" fill="none">
      <g className="portal-constellation__paths">
        <path d="M82 122 214 70l116 96 143-52 128 91" />
        <path d="m124 386 122-104 124 72 114-126 146 108" />
        <path d="m214 70 32 212 227-168 11 114" />
        <path d="m330 166 40 188 231-149" />
      </g>
      <g className="portal-constellation__nodes">
        <circle cx="82" cy="122" r="4" /><circle cx="214" cy="70" r="5" />
        <circle cx="330" cy="166" r="4" /><circle cx="473" cy="114" r="6" />
        <circle cx="601" cy="205" r="4" /><circle cx="124" cy="386" r="4" />
        <circle cx="246" cy="282" r="6" /><circle cx="370" cy="354" r="4" />
        <circle cx="484" cy="228" r="5" /><circle cx="630" cy="336" r="4" />
      </g>
      <g className="portal-constellation__pulses">
        <circle cx="246" cy="282" r="16" /><circle cx="473" cy="114" r="18" />
        <circle cx="630" cy="336" r="15" />
      </g>
    </svg>
  );
}
