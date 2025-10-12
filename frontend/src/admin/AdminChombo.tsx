import React, { useContext, useState } from "react";
import { Button, TextField, Stack, Autocomplete } from "@mui/material";
import { AuthContext } from "@/common/AuthContext";
import { setChomboAPI } from "@/api/GameAPI";
import { usePlayers } from "@/hooks/GameHooks";
import type { GameVariant } from "@/types";
import { logger } from "@/common/logger";

const gameVariants: { label: string; value: GameVariant }[] = [
    { label: "Riichi", value: "jp" },
    { label: "Hong Kong", value: "hk" },
];

const AdminChombo = () => {
    const { player } = useContext(AuthContext);
    const [gameId, setGameId] = useState<number>(0);
    const [gameVariant, setGameVariant] = useState<GameVariant>("jp");
    const [playerId, setPlayerId] = useState<string>("");
    const [chomboCount, setChomboCount] = useState<number>(0);
    const playersResult = usePlayers(gameVariant, "CASUAL");

    if (!player) {
        return <>No player logged in</>;
    }
    if (!playersResult.isSuccess) {
        return <>Loading ...</>;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await setChomboAPI(gameId, gameVariant, playerId, chomboCount);
            if (response.data.count === 0) {
                alert("No chombo count updated!");
                return;
            }
            alert("Chombo count updated successfully!");
        } catch (error) {
            logger.error("Failed to update chombo count:", error);
            alert("Failed to update chombo count.");
        }
    };

    return (
        <Stack spacing={2}>
            <Autocomplete
                isOptionEqualToValue={(option, value) => option.label === value.label}
                options={gameVariants}
                defaultValue={gameVariants[0]}
                onChange={(event, value) => setGameVariant(value!.value)}
                renderInput={(params) => <TextField {...params} placeholder="Choose a variant" />}
            />
            <TextField
                label="Game ID"
                type="number"
                value={gameId}
                onChange={(e) => setGameId(Number(e.target.value))}
                fullWidth
            />
            <Autocomplete
                isOptionEqualToValue={(option, value) => option.label === value.label}
                options={playersResult.data.map((player) => ({
                    label: player.username,
                    value: player.playerId,
                }))}
                onChange={(event, value) => setPlayerId(value!.value)}
                renderInput={(params) => <TextField {...params} placeholder="Username" />}
            />
            <TextField
                label="Chombo Count"
                type="number"
                value={chomboCount}
                onChange={(e) => setChomboCount(Number(e.target.value))}
                fullWidth
            />

            <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                Update Chombo Count
            </Button>
        </Stack>
    );
};
export default AdminChombo;
