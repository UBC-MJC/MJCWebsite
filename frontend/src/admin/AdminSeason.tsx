import React, {FC, useContext, useEffect, useState} from "react";
import {AuthContext} from "../common/AuthContext";
import {createSeasonAdmin, getSeasonsAdmin} from "../api/AdminAPI";
import {AxiosError} from "axios";
import {Table, Button} from "react-bootstrap";
import AdminSeasonRow from "./AdminSeasonRow";

const AdminSeason: FC = () => {
    const { player } = useContext(AuthContext)

    const [currentSeason, setCurrentSeason] = useState<ISeason | undefined>(undefined)
    const [pastSeasons, setPastSeasons] = useState<ISeason[]>([])

    useEffect(() => {
        getSeasonsAdmin(player!.authToken).then((response) => {
            setCurrentSeason(response.data.currentSeason)
            setPastSeasons(response.data.pastSeasons)
        }).catch((error: AxiosError) => {
            console.log("Error fetching seasons: ", error.response?.data)
        })
    }, [player])

    const startSeason = () => {
        createSeasonAdmin(player!.authToken, "Test Season").then((response) => {
            console.log("Created season")
        }).catch((error: AxiosError) => {
            console.log("Error creating season: ", error.response?.data)
        })
    }

    return (
        <>
            <div>
                <h2>Current Season</h2>
                <div>
                    {currentSeason ? (
                        <Table striped bordered hover responsive className="my-4">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AdminSeasonRow key={currentSeason.id} season={currentSeason} />
                            </tbody>
                        </Table>
                    ) : (
                        <>
                            <p>No current season</p>
                            <Button variant="primary" onClick={startSeason}>
                                Start Season
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <div>
                <h2>Past Seasons</h2>
                <Table striped bordered hover responsive className="my-4">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastSeasons.map((season) => <AdminSeasonRow key={season.id} season={season} />)}
                    </tbody>
                </Table>
            </div>
        </>
    );
}

export default AdminSeason