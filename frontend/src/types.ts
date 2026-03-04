export type Restaurante = {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string | null;
};

export type Menu = {
  id: number;
  restauranteId: number;
  nombre: string;
  precio: string | number; // Prisma Decimal puede llegar como string
  disponible: boolean;
};