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
import { fetchTournamentGroups } from "@/lib/api-client";
import {
  ALL_TOURNAMENTS_STRING,
  defaultAllTournament,
  selectedTournamentAtom,
  tournamentGroupsAtom,
} from "@/store/tournament";
import { Tournament, TournamentGroup } from "@/types/tournament";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { Trophy, Crown, Award, Star } from "lucide-react";
import { useEffect } from "react";

const getEventIcon = (eventAbbr: string) => {
  switch (eventAbbr) {
    case "G":
      return <Crown className="mr-2 h-4 w-4 text-yellow-400" />;
    case "M":
      return <Award className="mr-2 h-4 w-4 text-blue-400" />;
    case "A":
      return <Star className="mr-2 h-4 w-4 text-green-400" />;
    default:
      return <Trophy className="mr-2 h-4 w-4 text-gray-400" />;
  }
};

const getEventLabel = (eventType: string, eventAbbr: string) => {
  switch (eventAbbr) {
    case "G":
      return "Grand Slams";
    case "M":
      return "Masters 1000";
    case "A":
      return "Tour Events";
    default:
      return eventType;
  }
};

export const TournamentDropdown = () => {
  const [tournamentGroups, setTournamentGroups] = useAtom(tournamentGroupsAtom);
  const [selectedTournament, setSelectedTournament] = useAtom(
    selectedTournamentAtom
  );

  const { data, isLoading, isError } = useQuery<TournamentGroup[]>({
    queryKey: ["tournament-groups"],
    queryFn: fetchTournamentGroups,
  });

  useEffect(() => {
    if (data) {
      setTournamentGroups(data);
    }
  }, [data, setTournamentGroups]);

  useEffect(() => {
    if (!selectedTournament) {
      setSelectedTournament(defaultAllTournament);
    }
  }, [selectedTournament, setSelectedTournament]);

  const handleTournamentChange = (value: string) => {
    if (value === ALL_TOURNAMENTS_STRING) {
      setSelectedTournament(defaultAllTournament);
    } else {
      if (tournamentGroups) {
        // Find the tournament across all groups
        for (const group of tournamentGroups) {
          const selected = group.tournaments.find(
            (tournament: Tournament) => tournament.name === value
          );
          if (selected) {
            // Add the event_type information from the group to the tournament
            const tournamentWithEventType = {
              ...selected,
              event_type: {
                event_type_id: 0, // We don't have this from the group
                event_type: group.event_type,
                event_abbr: group.event_abbr,
              },
            };
            setSelectedTournament(tournamentWithEventType);
            break;
          }
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
        <SelectValue
          placeholder={ALL_TOURNAMENTS_STRING}
          className="text-white text-center"
        />
      </SelectTrigger>
      <SelectContent
        className={`${dropdownContentClass} max-h-96 overflow-y-auto`}
      >
        <SelectItem
          value={ALL_TOURNAMENTS_STRING}
          className={`${dropdownItemClass} font-semibold border-b border-gray-600 mb-2`}
        >
          <div className="flex items-center justify-center">
            <Trophy className="mr-2 h-4 w-4 text-green-400" />
            All Tournaments
          </div>
        </SelectItem>
        {tournamentGroups &&
          tournamentGroups.map((group: TournamentGroup) => (
            <div key={group.event_abbr} className="mb-4">
              {/* Group Header */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center border-b border-gray-700">
                {getEventIcon(group.event_abbr)}
                {getEventLabel(group.event_type, group.event_abbr)}
              </div>
              {/* Tournament Items */}
              {group.tournaments.map((tournament: Tournament) => (
                <SelectItem
                  key={tournament.tournament_id}
                  value={tournament.name}
                  className={`${dropdownItemClass} text-sm`}
                >
                  {tournament.name}
                </SelectItem>
              ))}
            </div>
          ))}
      </SelectContent>
    </Select>
  );
};
