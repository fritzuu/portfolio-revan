export const DISCOVERIES = [
  {
    id: 'jekek',
    title: 'Jekek, an old friend',
    place: 'jekek',
    text: 'Jekek was Revan’s pet python. His golden coat and dark brown patterns are recreated from Revan’s photo.',
  },
  {
    id: 'dream',
    title: 'A favorite in the shadows',
    place: 'dream',
    text: 'Darkrai is Revan’s favorite Pokémon. This quiet grove is a little tribute to that favorite.',
  },
  {
    id: 'football',
    title: 'Football company',
    place: 'football',
    text: 'Messi and Lamine Yamal share this little pitch with the residents. Watch a few passes or try three shots yourself.',
  },
  {
    id: 'story',
    title: 'The person behind the pixels',
    place: 'story',
    text: 'Revan builds full stack projects. This world brings together his work, his old pet and a few of his favorite things.',
  },
  {
    id: 'shore',
    title: 'The patient anglers',
    place: 'shore',
    text: 'Three residents come here to cast, wait and reel. Their catches are just part of the scenery; your own backpack stays yours.',
  },
];
export function cleanDiscoveries(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id) => DISCOVERIES.some((d) => d.id === id)))]
    : [];
}
export function gateUnlocked(discoveries) {
  return cleanDiscoveries(discoveries).length >= 2;
}
export function shotScores(aim) {
  return Number.isFinite(aim) && aim >= 40 && aim <= 60;
}
