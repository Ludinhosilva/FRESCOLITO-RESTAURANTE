// Tipos generados desde Supabase (no editar a mano).
// Regenerar: ver README.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      configuracion: {
        Row: {
          actualizado_en: string
          clave: string
          valor: Json
        }
        Insert: {
          actualizado_en?: string
          clave: string
          valor: Json
        }
        Update: {
          actualizado_en?: string
          clave?: string
          valor?: Json
        }
        Relationships: []
      }
      mesas: {
        Row: {
          id: number
          nombre: string | null
          numero: number
        }
        Insert: {
          id?: number
          nombre?: string | null
          numero: number
        }
        Update: {
          id?: number
          nombre?: string | null
          numero?: number
        }
        Relationships: []
      }
      orden_contador: {
        Row: {
          dia: string
          ultimo: number
        }
        Insert: {
          dia: string
          ultimo?: number
        }
        Update: {
          dia?: string
          ultimo?: number
        }
        Relationships: []
      }
      pedido_items: {
        Row: {
          actualizado_en: string
          cantidad: number
          estado: Database["public"]["Enums"]["item_status"]
          id: string
          pedido_id: string
          plato_id: number | null
          plato_nombre: string
          precio_unitario: number
        }
        Insert: {
          actualizado_en?: string
          cantidad: number
          estado?: Database["public"]["Enums"]["item_status"]
          id?: string
          pedido_id: string
          plato_id?: number | null
          plato_nombre: string
          precio_unitario: number
        }
        Update: {
          actualizado_en?: string
          cantidad?: number
          estado?: Database["public"]["Enums"]["item_status"]
          id?: string
          pedido_id?: string
          plato_id?: number | null
          plato_nombre?: string
          precio_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_plato_id_fkey"
            columns: ["plato_id"]
            isOneToOne: false
            referencedRelation: "platos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_logs: {
        Row: {
          accion: string
          creado_en: string
          detalle: Json | null
          id: number
          pedido_id: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          creado_en?: string
          detalle?: Json | null
          id?: number
          pedido_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          creado_en?: string
          detalle?: Json | null
          id?: number
          pedido_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_logs_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          actualizado_en: string
          ajuste: number
          ajuste_nota: string | null
          canal: Database["public"]["Enums"]["canal_pedido"]
          cargo_envases: number
          cliente_direccion: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          cobrado_por: string | null
          codigo_seguimiento: string | null
          comision_llevar: number
          costo_delivery: number
          creado_en: string
          dia: string
          editado_en: string | null
          editado_por: string | null
          estado: Database["public"]["Enums"]["order_status"]
          estado_pago: Database["public"]["Enums"]["estado_pago"]
          id: string
          mesa_id: number | null
          mesera_id: string | null
          metodo_pago: Database["public"]["Enums"]["pago_method"] | null
          monto_cobrado: number | null
          notas: string | null
          numero_orden: number
          para_llevar: boolean
          referencia_pago: string | null
          subtotal: number
          total: number
        }
        Insert: {
          actualizado_en?: string
          ajuste?: number
          ajuste_nota?: string | null
          canal?: Database["public"]["Enums"]["canal_pedido"]
          cargo_envases?: number
          cliente_direccion?: string | null
          cliente_nombre?: string | null
          cliente_telefono?: string | null
          cobrado_por?: string | null
          codigo_seguimiento?: string | null
          comision_llevar?: number
          costo_delivery?: number
          creado_en?: string
          dia: string
          editado_en?: string | null
          editado_por?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          estado_pago?: Database["public"]["Enums"]["estado_pago"]
          id?: string
          mesa_id?: number | null
          mesera_id?: string | null
          metodo_pago?: Database["public"]["Enums"]["pago_method"] | null
          monto_cobrado?: number | null
          notas?: string | null
          numero_orden: number
          para_llevar?: boolean
          referencia_pago?: string | null
          subtotal?: number
          total?: number
        }
        Update: {
          actualizado_en?: string
          ajuste?: number
          ajuste_nota?: string | null
          canal?: Database["public"]["Enums"]["canal_pedido"]
          cargo_envases?: number
          cliente_direccion?: string | null
          cliente_nombre?: string | null
          cliente_telefono?: string | null
          cobrado_por?: string | null
          codigo_seguimiento?: string | null
          comision_llevar?: number
          costo_delivery?: number
          creado_en?: string
          dia?: string
          editado_en?: string | null
          editado_por?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          estado_pago?: Database["public"]["Enums"]["estado_pago"]
          id?: string
          mesa_id?: number | null
          mesera_id?: string | null
          metodo_pago?: Database["public"]["Enums"]["pago_method"] | null
          monto_cobrado?: number | null
          notas?: string | null
          numero_orden?: number
          para_llevar?: boolean
          referencia_pago?: string | null
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cobrado_por_fkey"
            columns: ["cobrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_editado_por_fkey"
            columns: ["editado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_mesa_id_fkey"
            columns: ["mesa_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_mesera_id_fkey"
            columns: ["mesera_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      platos: {
        Row: {
          activo: boolean
          categoria: string
          creado_en: string
          descripcion: string | null
          id: number
          imagen: string | null
          incluye_refresco: boolean
          nombre: string
          precio: number
          stock: number
          stock_disponible: boolean
        }
        Insert: {
          activo?: boolean
          categoria: string
          creado_en?: string
          descripcion?: string | null
          id?: number
          imagen?: string | null
          incluye_refresco?: boolean
          nombre: string
          precio: number
          stock?: number
          stock_disponible?: boolean
        }
        Update: {
          activo?: boolean
          categoria?: string
          creado_en?: string
          descripcion?: string | null
          id?: number
          imagen?: string | null
          incluye_refresco?: boolean
          nombre?: string
          precio?: number
          stock?: number
          stock_disponible?: boolean
        }
        Relationships: []
      }
      reservas: {
        Row: {
          creado_en: string
          estado: Database["public"]["Enums"]["reserva_status"]
          fecha: string
          hora: string
          id: string
          mesa_id: number | null
          nombre_cliente: string
          personas: number
          telefono: string | null
        }
        Insert: {
          creado_en?: string
          estado?: Database["public"]["Enums"]["reserva_status"]
          fecha: string
          hora: string
          id?: string
          mesa_id?: number | null
          nombre_cliente: string
          personas: number
          telefono?: string | null
        }
        Update: {
          creado_en?: string
          estado?: Database["public"]["Enums"]["reserva_status"]
          fecha?: string
          hora?: string
          id?: string
          mesa_id?: number | null
          nombre_cliente?: string
          personas?: number
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_mesa_id_fkey"
            columns: ["mesa_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          activo: boolean
          creado_en: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          activo?: boolean
          creado_en?: string
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          activo?: boolean
          creado_en?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjuntar_referencia: {
        Args: { p_codigo: string; p_referencia: string }
        Returns: undefined
      }
      cancelar_pedido: { Args: { p_pedido_id: string }; Returns: undefined }
      cobrar_mesa: {
        Args: {
          p_metodo: Database["public"]["Enums"]["pago_method"]
          p_monto: number
          p_pedido_id: string
        }
        Returns: undefined
      }
      consultar_pedido_cliente: { Args: { p_codigo: string }; Returns: Json }
      crear_pedido: {
        Args: {
          p_items: Json
          p_mesa_id: number
          p_metodo_pago: Database["public"]["Enums"]["pago_method"]
          p_notas: string
          p_para_llevar: boolean
        }
        Returns: {
          actualizado_en: string
          ajuste: number
          ajuste_nota: string | null
          canal: Database["public"]["Enums"]["canal_pedido"]
          cargo_envases: number
          cliente_direccion: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          cobrado_por: string | null
          codigo_seguimiento: string | null
          comision_llevar: number
          costo_delivery: number
          creado_en: string
          dia: string
          editado_en: string | null
          editado_por: string | null
          estado: Database["public"]["Enums"]["order_status"]
          estado_pago: Database["public"]["Enums"]["estado_pago"]
          id: string
          mesa_id: number | null
          mesera_id: string | null
          metodo_pago: Database["public"]["Enums"]["pago_method"] | null
          monto_cobrado: number | null
          notas: string | null
          numero_orden: number
          para_llevar: boolean
          referencia_pago: string | null
          subtotal: number
          total: number
        }
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crear_pedido_cliente: {
        Args: {
          p_canal: Database["public"]["Enums"]["canal_pedido"]
          p_direccion: string
          p_items: Json
          p_metodo_pago: Database["public"]["Enums"]["pago_method"]
          p_nombre: string
          p_notas: string
          p_telefono: string
        }
        Returns: Json
      }
      editar_pedido: {
        Args: {
          p_ajuste: number
          p_ajuste_nota: string
          p_estado: Database["public"]["Enums"]["order_status"]
          p_estado_pago: Database["public"]["Enums"]["estado_pago"]
          p_items: Json
          p_metodo_pago: Database["public"]["Enums"]["pago_method"]
          p_monto_cobrado: number
          p_notas: string
          p_pedido_id: string
        }
        Returns: undefined
      }
      eliminar_plato: { Args: { p_plato_id: number }; Returns: undefined }
      es_admin: { Args: never; Returns: boolean }
      esta_abierto: { Args: never; Returns: boolean }
      mi_rol: { Args: never; Returns: Database["public"]["Enums"]["user_role"] }
      monitoreo: { Args: never; Returns: Json }
      registrar_cobro: {
        Args: {
          p_metodo: Database["public"]["Enums"]["pago_method"]
          p_monto: number
          p_pedido_id: string
        }
        Returns: undefined
      }
      siguiente_numero_orden: { Args: { p_dia: string }; Returns: number }
      ventas_del_dia: { Args: { p_dia?: string }; Returns: Json }
      ventas_rango: {
        Args: { p_desde: string; p_hasta: string }
        Returns: Json
      }
      verificar_pago: {
        Args: {
          p_estado: Database["public"]["Enums"]["estado_pago"]
          p_pedido_id: string
          p_referencia: string
        }
        Returns: undefined
      }
    }
    Enums: {
      canal_pedido: "salon" | "delivery" | "recojo"
      estado_pago: "pendiente" | "por_verificar" | "pagado" | "contra_entrega"
      item_status: "en_preparacion" | "listo"
      order_status:
        | "pendiente"
        | "en_preparacion"
        | "listo"
        | "entregado"
        | "cancelado"
        | "en_camino"
      pago_method: "efectivo" | "yape" | "plin"
      reserva_status: "pendiente" | "confirmada" | "cancelada"
      user_role: "mesera" | "cocina" | "admin" | "repartidor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      canal_pedido: ["salon", "delivery", "recojo"],
      estado_pago: ["pendiente", "por_verificar", "pagado", "contra_entrega"],
      item_status: ["en_preparacion", "listo"],
      order_status: [
        "pendiente",
        "en_preparacion",
        "listo",
        "entregado",
        "cancelado",
        "en_camino",
      ],
      pago_method: ["efectivo", "yape", "plin"],
      reserva_status: ["pendiente", "confirmada", "cancelada"],
      user_role: ["mesera", "cocina", "admin", "repartidor"],
    },
  },
} as const
