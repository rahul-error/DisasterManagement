/*
# Seed Initial Data

Populates emergency_contacts and resources tables with default content for the MVP.
These are publicly readable (RLS SELECT policy already allows authenticated users).
Safe to re-run — uses ON CONFLICT to avoid duplicates.
*/

-- Emergency contacts
INSERT INTO public.emergency_contacts (name, phone, description)
VALUES
  ('Police', '100', 'General police emergency helpline available 24/7 nationwide.'),
  ('Ambulance', '108', 'Free ambulance service for medical emergencies.'),
  ('Fire Brigade', '101', 'Fire and rescue emergency service.'),
  ('NDRF Helpline', '1070', 'National Disaster Response Force helpline for disaster-related assistance.'),
  ('SDRF Control Room', '1077', 'State Disaster Response Force control room.')
ON CONFLICT (id) DO NOTHING;

-- Disaster resources: Do's and Don'ts
INSERT INTO public.resources (disaster_type, title, dos, donts)
VALUES
  (
    'Earthquake',
    'Earthquake Safety — Do''s and Don''ts',
    ARRAY[
      'Drop to your hands and knees before the earthquake drops you.',
      'Cover your head and neck under a sturdy table or desk.',
      'Hold on to your shelter until the shaking stops.',
      'Stay indoors until the shaking stops and it is safe to exit.',
      'If outdoors, move to an open area away from buildings and power lines.',
      'After the shaking stops, check yourself and others for injuries.'
    ],
    ARRAY[
      'Do not run outside while the building is shaking.',
      'Do not use elevators during or immediately after an earthquake.',
      'Do not stand near windows, mirrors, or glass walls.',
      'Do not light a match or use electrical switches if you smell gas.',
      'Do not panic — stay calm and help others around you.'
    ]
  ),
  (
    'Flood',
    'Flood Safety — Do''s and Don''ts',
    ARRAY[
      'Move to higher ground or a safe elevated area immediately.',
      'Turn off utilities (gas, electricity, water) at the main switches.',
      'Keep emergency supplies, documents, and valuables in a waterproof bag.',
      'Listen to local radio or alerts for updates and evacuation orders.',
      'Keep a stocked first-aid kit and clean drinking water ready.'
    ],
    ARRAY[
      'Do not walk, swim, or drive through floodwaters — even shallow water can sweep you away.',
      'Do not drink floodwater — it may be contaminated.',
      'Do not touch electrical equipment if you are wet or standing in water.',
      'Do not return to your home until authorities declare it safe.',
      'Do not ignore official evacuation orders.'
    ]
  ),
  (
    'Fire',
    'Fire Safety — Do''s and Don''ts',
    ARRAY[
      'Raise the alarm and call the fire brigade (101) immediately.',
      'Crawl low under smoke to breathe cleaner air near the floor.',
      'Feel doors with the back of your hand before opening — if hot, do not open.',
      'Use the nearest safe exit and follow the building evacuation plan.',
      'If your clothes catch fire, STOP, DROP, and ROLL to smother the flames.'
    ],
    ARRAY[
      'Do not use elevators — use stairs to evacuate.',
      'Do not re-enter a burning building for belongings.',
      'Do not open a hot door — fire and smoke may be behind it.',
      'Do not attempt to fight a large fire yourself — evacuate and wait for professionals.',
      'Do not panic or push others while evacuating.'
    ]
  )
ON CONFLICT (id) DO NOTHING;
