import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';
import {
  tournamentsAtom,
  selectedTournamentAtom,
  defaultAllTournament,
  ALL_TOURNAMENTS_STRING,
} from '@/store/tournament';
import { useQuery } from '@tanstack/react-query';
import { fetchTournaments } from '@/services/api-utils';
import { Tournament } from '@/types/tournament';

export const TournamentDropdown = () => {
  const [tournaments, setTournaments] = useAtom(tournamentsAtom);
  const [selectedTournament, setSelectedTournament] = useAtom(selectedTournamentAtom);

  const { data, isLoading, isError } = useQuery<Tournament[]>({
    queryKey: ['tournaments'],
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
        const selected = tournaments.find((tournament: Tournament) => tournament.name === value);
        if (selected) {
          setSelectedTournament(selected);
        }
      }
    }
  };

  if (isError) {
    return <p className='text-red-500'>Error loading tournaments!</p>;
  }

  return (
    <Select onValueChange={handleTournamentChange} value={selectedTournament.name} disabled={isLoading}>
      <SelectTrigger className='select-trigger w-48'>
        <SelectValue placeholder={ALL_TOURNAMENTS_STRING} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_TOURNAMENTS_STRING}>All Tournaments</SelectItem>
        {tournaments &&
          tournaments.map((tournament: Tournament) => {
            return (
              <SelectItem key={tournament.tournament_id} value={tournament.name}>
                {tournament.name}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};
