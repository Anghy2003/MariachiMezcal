-- Reservas de serenatas. Cada una nace "pendiente" y la dueña la confirma o cancela desde el panel.
CREATE TABLE reservas (
  id TEXT PRIMARY KEY,               -- identificador interno (UUID)
  code TEXT NOT NULL UNIQUE,         -- código corto para el cliente, ej. MZ-7K3F
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada')),
  created_at TEXT NOT NULL,          -- fecha y hora en que se hizo la reserva (ISO, UTC)
  updated_at TEXT NOT NULL,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  pais TEXT NOT NULL,
  telefono TEXT NOT NULL,            -- con código de país, ej. +593 959709016
  fecha TEXT NOT NULL,               -- día del evento, AAAA-MM-DD
  hora TEXT NOT NULL,                -- hora del evento, HH:MM
  direccion TEXT NOT NULL,
  items TEXT NOT NULL,               -- paquetes, regalos y adicionales (JSON), con precios calculados por el servidor
  total INTEGER NOT NULL,            -- total en dólares, calculado por el servidor
  abono INTEGER NOT NULL DEFAULT 0,  -- 1 cuando la dueña marca que recibió el abono
  notas TEXT NOT NULL DEFAULT '',    -- notas internas de la dueña
  calendar_event_id TEXT             -- evento de Google Calendar (fase 2)
);

CREATE INDEX idx_reservas_fecha ON reservas (fecha, hora);
CREATE INDEX idx_reservas_status ON reservas (status);

-- Límite de reservas por persona (por IP, guardada solo como huella cifrada) para frenar el spam.
CREATE TABLE limites (
  clave TEXT NOT NULL,
  ventana TEXT NOT NULL,             -- la hora en curso, ej. 2026-10-01T14
  cuenta INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (clave, ventana)
);
