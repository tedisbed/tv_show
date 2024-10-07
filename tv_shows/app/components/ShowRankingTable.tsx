import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ShowRanking {
  title: string;
  platform: string;
  points: number;
  weekCount: number;
  image: string | null;
  inRecentRanking: boolean;
}

const ShowRankingTable = () => {
  const [rankings, setRankings] = useState<ShowRanking[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      // First API call to get rankings
      let { data: rankingsData, error: rankingsError } = await supabase
        .from('TopTenList')
        .select(`
          Shows (
            title
          ),
          rank,
          date
        `)
        .order('date', { ascending: false });

      if (rankingsError) {
        console.error('Error fetching rankings:', rankingsError);
        return;
      }

      // Get the most recent date
      const mostRecentDate = rankingsData[0]?.date;

      // Process rankings data
      const showPoints = rankingsData.reduce((acc, item) => {
        const title = item.Shows.title;
        const points = 11 - item.rank;
        if (!acc[title]) {
          acc[title] = { points: 0, weekCount: 0, inRecentRanking: false };
        }
        acc[title].points += points;
        acc[title].weekCount += 1;
        if (item.date === mostRecentDate) {
          acc[title].inRecentRanking = true;
        }
        return acc;
      }, {} as Record<string, { points: number; weekCount: number; inRecentRanking: boolean }>);

      // Second API call to get show details including platform and image
      let { data: showsData, error: showsError } = await supabase
        .from('Shows')
        .select('id, title, platform, image');

      if (showsError) {
        console.error('Error fetching show data:', showsError);
        return;
      }

      // Combine rankings and show data
      const rankingsArray = Object.entries(showPoints).map(([title, { points, weekCount, inRecentRanking }]) => {
        const showData = showsData.find(show => show.title === title);
        return {
          title,
          platform: showData?.platform || 'Unknown',
          points,
          weekCount,
          image: showData?.image || null,
          inRecentRanking
        };
      });

      rankingsArray.sort((a, b) => b.points - a.points);
      setRankings(rankingsArray);
    } catch (error) {
      console.error('Exception occurred:', error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Show Rankings</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Show Name</th>
            <th className="px-4 py-2 text-left">Platform</th>
            <th className="px-4 py-2 text-left">Points</th>
            <th className="px-4 py-2 text-left">Weeks in Top 10</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((show, index) => (
            <tr 
              key={show.title} 
              className={`
                ${index % 2 === 0 ? 'bg-gray-100' : ''}
                ${show.inRecentRanking ? 'bg-blue-200 hover:bg-blue-300' : 'hover:bg-gray-200'}
                relative group
              `}
            >
              <td className="px-4 py-2">{show.title}</td>
              <td className="px-4 py-2">{show.platform}</td>
              <td className="px-4 py-2">{show.points}</td>
              <td className="px-4 py-2">{show.weekCount}</td>
              {show.image && (
                <td className="absolute left-full top-0 hidden group-hover:block z-10">
                  <img
                    src={show.image}
                    alt={`${show.title} poster`}
                    className="rounded shadow-lg"
                    style={{ maxWidth: '100px', maxHeight: '150px' }}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShowRankingTable;