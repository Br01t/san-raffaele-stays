import { describe, it, expect } from 'vitest';
import { AgendaEvent, AgendaInstance, expandEvent, layoutDay, startOfWeek } from '@/lib/agenda';

const ev = (over: Partial<AgendaEvent>): AgendaEvent => ({
  id: 'e1',
  title: 'Test',
  description: null,
  location: null,
  start_date: '2026-10-05',
  end_date: '2026-10-05',
  start_time: '09:00',
  end_time: '10:00',
  all_day: false,
  color: 'peacock',
  apartment_id: null,
  recurrence: 'none',
  recurrence_until: null,
  exdates: [],
  created_at: '',
  updated_at: '',
  ...over,
});

describe('agenda', () => {
  it('la settimana parte dal lunedì', () => {
    expect(startOfWeek('2026-10-31')).toBe('2026-10-26'); // sabato -> lunedì
    expect(startOfWeek('2026-10-26')).toBe('2026-10-26');
  });

  it('evento singolo visibile solo se interseca l’intervallo', () => {
    expect(expandEvent(ev({}), '2026-10-01', '2026-10-31')).toHaveLength(1);
    expect(expandEvent(ev({}), '2026-11-01', '2026-11-30')).toHaveLength(0);
  });

  it('ricorrenza settimanale con fine ed eccezioni', () => {
    const e = ev({ recurrence: 'weekly', recurrence_until: '2026-10-31', exdates: ['2026-10-19'] });
    expect(expandEvent(e, '2026-10-01', '2026-12-31').map((i) => i.date)).toEqual(['2026-10-05', '2026-10-12', '2026-10-26']);
  });

  it('ricorrenza mensile il 31 salta i mesi più corti', () => {
    const e = ev({ start_date: '2026-01-31', end_date: '2026-01-31', recurrence: 'monthly' });
    expect(expandEvent(e, '2026-01-01', '2026-05-31').map((i) => i.date)).toEqual(['2026-01-31', '2026-03-31', '2026-05-31']);
  });

  it('evento di più giorni iniziato prima resta visibile', () => {
    const e = ev({ start_date: '2026-10-30', end_date: '2026-11-02', all_day: true });
    const [i] = expandEvent(e, '2026-11-01', '2026-11-30');
    expect(i.endDate).toBe('2026-11-02');
  });

  it('eventi sovrapposti vanno in colonne affiancate', () => {
    const mk = (key: string, s: string, e: string): AgendaInstance => ({
      key, eventId: key, title: key, date: '2026-10-05', endDate: '2026-10-05', startTime: s, endTime: e,
      allDay: false, color: '#000', layer: 'agenda',
    });
    const out = layoutDay([mk('a', '09:00', '10:00'), mk('b', '09:30', '11:00'), mk('c', '12:00', '13:00')]);
    const by = Object.fromEntries(out.map((o) => [o.item.key, o]));
    expect(by.a.cols).toBe(2);
    expect(by.b.col).toBe(1);
    expect(by.c.cols).toBe(1);
  });
});
