import { ReactNode, useEffect, useState } from "react";
import { Box, Button, Collapse, Divider, Stack, ToggleButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SpacedToggleButtonGroup } from "@/theme/utils";

export interface ActionButton<V extends string> {
    name: string;
    value: V;
}

interface TransactionTypeSelectorProps<V extends string> {
    /** Full ordered list of available transaction-type buttons. */
    buttons: ActionButton<V>[];
    /** Values that belong in the always-visible primary group, in display order. */
    primaryValues: readonly V[];
    /** Currently selected transaction type. */
    value: V;
    onChange: (value: V) => void;
    /** Extra controls rendered inside the collapsible "More options" panel. */
    extraOptions?: ReactNode;
}

const groupSx = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
} as const;

const buttonSx = {
    flex: "1 1 auto",
    minWidth: { xs: "30%", sm: "110px" },
    minHeight: 44,
    fontWeight: 600,
} as const;

// The primary group (Deal In / Self Draw / Deck Out) is the most-used control,
// so give it a taller hit target and larger label than the secondary actions.
const primaryButtonSx = {
    ...buttonSx,
    minHeight: 56,
    fontSize: "1.05rem",
} as const;

/**
 * Splits transaction-type buttons into an always-visible primary group
 * (e.g. Deal In / Self Draw / Deck Out) and a collapsible secondary group for
 * the less-common actions. Both groups share a single exclusive selection, so
 * picking in one visually deselects the other. If the active selection lives in
 * the secondary group, the disclosure auto-opens so it never falls out of view.
 */
const TransactionTypeSelector = <V extends string>({
    buttons,
    primaryValues,
    value,
    onChange,
    extraOptions,
}: TransactionTypeSelectorProps<V>) => {
    const primaryButtons = buttons.filter((b) => primaryValues.includes(b.value));
    const secondaryButtons = buttons.filter((b) => !primaryValues.includes(b.value));
    const selectionInSecondary = secondaryButtons.some((b) => b.value === value);
    const hasCollapsible = secondaryButtons.length > 0 || extraOptions != null;

    const [open, setOpen] = useState(selectionInSecondary);

    // Keep the disclosure open whenever the active selection lives inside it.
    useEffect(() => {
        if (selectionInSecondary) {
            setOpen(true);
        }
    }, [selectionInSecondary]);

    const renderGroup = (group: ActionButton<V>[], ariaLabel: string, isPrimary = false) => (
        <SpacedToggleButtonGroup
            exclusive
            value={value}
            onChange={(_event, next) => next && onChange(next as V)}
            sx={groupSx}
            aria-label={ariaLabel}
        >
            {group.map((button) => (
                <ToggleButton
                    key={button.value}
                    value={button.value}
                    id={button.name}
                    sx={isPrimary ? primaryButtonSx : buttonSx}
                >
                    {button.name}
                </ToggleButton>
            ))}
        </SpacedToggleButtonGroup>
    );

    return (
        <Box sx={{ width: "100%" }}>
            {renderGroup(primaryButtons, "round type", true)}

            {hasCollapsible && (
                <>
                    <Button
                        onClick={() => setOpen((prev) => !prev)}
                        variant="text"
                        color="inherit"
                        fullWidth
                        aria-expanded={open}
                        endIcon={
                            <ExpandMoreIcon
                                sx={{
                                    transition: "transform 0.2s ease",
                                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                                }}
                            />
                        }
                        sx={{ mt: 1, color: "text.secondary", fontWeight: 600 }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                            }}
                        >
                            More options
                        </Typography>
                    </Button>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Stack spacing={1.5} sx={{ pt: 1 }}>
                            {secondaryButtons.length > 0 &&
                                renderGroup(secondaryButtons, "more round types")}
                            {extraOptions != null && (
                                <>
                                    {secondaryButtons.length > 0 && <Divider flexItem />}
                                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                                        {extraOptions}
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </Collapse>
                </>
            )}
        </Box>
    );
};

export default TransactionTypeSelector;
