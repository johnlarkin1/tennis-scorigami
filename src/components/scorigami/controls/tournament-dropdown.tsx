import {
  dropdownContentClass,
  dropdownItemClass,
} from "@/components/lib/force-graph/styles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchTournaments } from "@/services/api-utils";
import {
  ALL_TOURNAMENTS_STRING,
  defaultAllTournament,
  selectedTournamentAtom,
  tournamentsAtom,
} from "@/store/tournament";
import { Tournament } from "@/types/tournament";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { Trophy } from "lucide-react";
import { useEffect } from "react";

export const TournamentDropdown = () => {
  const [tournaments, setTournaments] = useAtom(tournamentsAtom);
  const [selectedTournament, setSelectedTournament] = useAtom(
    selectedTournamentAtom
  );

  const { data, isLoading, isError } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: fetchTournaments,
  });

  useEffect(() => {
    if (data) {
      setTournaments(data);
    }
  }, [data, setTournaments]);

  useEffect(() => {
    if (!selectedTournament) {
      setSelectedTournament(defaultAllTournament);
    }
  }, [selectedTournament, setSelectedTournament]);

  const handleTournamentChange = (value: string) => {
    if (value === ALL_TOURNAMENTS_STRING) {
      setSelectedTournament(defaultAllTournament);
    } else {
      if (tournaments) {
        const selected = tournaments.find(
          (tournament: Tournament) => tournament.name === value
        );
        if (selected) {
          setSelectedTournament(selected);
        }
      }
    }
  };

  if (isError) {
    return <p className="text-red-500">Error loading tournaments!</p>;
  }

  return (
    <Select
      onValueChange={handleTournamentChange}
      value={selectedTournament.name}
      disabled={isLoading}
    >
      <SelectTrigger className="bg-gray-900 border border-gray-700 text-white h-10 rounded w-full flex items-center justify-center">
        <Trophy className="mr-2 h-4 w-4 text-green-400" />
        <SelectValue
          placeholder={ALL_TOURNAMENTS_STRING}
          className="text-white text-center"
        />
      </SelectTrigger>
      <SelectContent className={dropdownContentClass}>
        <SelectItem
          value={ALL_TOURNAMENTS_STRING}
          className={dropdownItemClass}
        >
          All Tournaments
        </SelectItem>
        {tournaments &&
          tournaments.map((tournament: Tournament) => {
            return (
              <SelectItem
                key={tournament.tournament_id}
                value={tournament.name}
                className={dropdownItemClass}
              >
                {tournament.name}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};
