import { Typography } from "@mui/material";

interface SectionHeaderProps {
    label: string;
}

/**
 * Atom — an uppercase overline label used to introduce content sections.
 * Consistent spacing and weight across every page that has grouped cards.
 */
const SectionHeader = ({ label }: SectionHeaderProps) => (
    <Typography
        variant="overline"
        sx={{ color: "text.secondary", fontWeight: 600, mb: 1.5, display: "block" }}
    >
        {label}
    </Typography>
);

export default SectionHeader;
