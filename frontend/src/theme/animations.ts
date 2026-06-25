import { keyframes } from "@mui/system";

// Gentle "breathing" pulse for live-indicator dots (nav Record button, live
// game header, live game cards). Shared so every live indicator animates
// identically.
export const pulse = keyframes`
    0%   { opacity: 1;    transform: scale(1);   }
    50%  { opacity: 0.35; transform: scale(0.8); }
    100% { opacity: 1;    transform: scale(1);   }
`;
