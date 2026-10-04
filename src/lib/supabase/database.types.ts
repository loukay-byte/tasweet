
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "profiles": {
                  Row: {
                    "age_band": Database["public"]['Enums']["age_band"] | null,"city": string | null,"consent_ad_cookies": boolean,"consent_data": boolean,"consented_at": string | null,"gender": Database["public"]['Enums']["gender"] | null,"language": string,"region": string | null,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "age_band"?: Database["public"]['Enums']["age_band"] | null,"city"?: string | null,"consent_ad_cookies"?: boolean,"consent_data"?: boolean,"consented_at"?: string | null,"gender"?: Database["public"]['Enums']["gender"] | null,"language"?: string,"region"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "age_band"?: Database["public"]['Enums']["age_band"] | null,"city"?: string | null,"consent_ad_cookies"?: boolean,"consent_data"?: boolean,"consented_at"?: string | null,"gender"?: Database["public"]['Enums']["gender"] | null,"language"?: string,"region"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"submissions": {
                  Row: {
                    "ai_screening": Json | null,"created_at": string,"id": string,"moderator_decision": Database["public"]['Enums']["moderator_decision"] | null,"reason": string | null,"reviewed_at": string | null,"reviewed_by": string | null,"topic_id": string
                  }
                  Insert: {
                    "ai_screening"?: Json | null,"created_at"?: string,"id"?: string,"moderator_decision"?: Database["public"]['Enums']["moderator_decision"] | null,"reason"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"topic_id": string
                  }
                  Update: {
                    "ai_screening"?: Json | null,"created_at"?: string,"id"?: string,"moderator_decision"?: Database["public"]['Enums']["moderator_decision"] | null,"reason"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"topic_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "submissions_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "submissions_topic_id_fkey"
      columns: ["topic_id"]
isOneToOne: false
      referencedRelation: "topics"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "created_at": string,"current_period_end": string | null,"id": string,"payment_reference": string | null,"plan": Database["public"]['Enums']["subscription_plan"],"status": Database["public"]['Enums']["subscription_status"],"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"current_period_end"?: string | null,"id"?: string,"payment_reference"?: string | null,"plan": Database["public"]['Enums']["subscription_plan"],"status"?: Database["public"]['Enums']["subscription_status"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"current_period_end"?: string | null,"id"?: string,"payment_reference"?: string | null,"plan"?: Database["public"]['Enums']["subscription_plan"],"status"?: Database["public"]['Enums']["subscription_status"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"topic_stats": {
                  Row: {
                    "breakdowns": NonNullable<Json>,"hour": string,"topic_id": string,"verified_a": number,"verified_b": number
                  }
                  Insert: {
                    "breakdowns"?: NonNullable<Json>,"hour": string,"topic_id": string,"verified_a"?: number,"verified_b"?: number
                  }
                  Update: {
                    "breakdowns"?: NonNullable<Json>,"hour"?: string,"topic_id"?: string,"verified_a"?: number,"verified_b"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "topic_stats_topic_id_fkey"
      columns: ["topic_id"]
isOneToOne: false
      referencedRelation: "topics"
      referencedColumns: ["id"]
    }
                  ]
                },"topics": {
                  Row: {
                    "category": Database["public"]['Enums']["topic_category"],"closes_at": string | null,"created_at": string,"description_ar": string | null,"description_en": string | null,"featured_on": string | null,"id": string,"is_sponsored": boolean,"opens_at": string | null,"option_a_ar": string,"option_a_en": string | null,"option_b_ar": string,"option_b_en": string | null,"question_ar": string,"question_en": string | null,"slug": string,"status": Database["public"]['Enums']["topic_status"],"submitted_by": string | null
                  }
                  Insert: {
                    "category"?: Database["public"]['Enums']["topic_category"],"closes_at"?: string | null,"created_at"?: string,"description_ar"?: string | null,"description_en"?: string | null,"featured_on"?: string | null,"id"?: string,"is_sponsored"?: boolean,"opens_at"?: string | null,"option_a_ar": string,"option_a_en"?: string | null,"option_b_ar": string,"option_b_en"?: string | null,"question_ar": string,"question_en"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["topic_status"],"submitted_by"?: string | null
                  }
                  Update: {
                    "category"?: Database["public"]['Enums']["topic_category"],"closes_at"?: string | null,"created_at"?: string,"description_ar"?: string | null,"description_en"?: string | null,"featured_on"?: string | null,"id"?: string,"is_sponsored"?: boolean,"opens_at"?: string | null,"option_a_ar"?: string,"option_a_en"?: string | null,"option_b_ar"?: string,"option_b_en"?: string | null,"question_ar"?: string,"question_en"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["topic_status"],"submitted_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "topics_submitted_by_fkey"
      columns: ["submitted_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"users": {
                  Row: {
                    "auth_provider": string | null,"created_at": string,"email": string | null,"id": string,"role": Database["public"]['Enums']["user_role"],"trust_score": number
                  }
                  Insert: {
                    "auth_provider"?: string | null,"created_at"?: string,"email"?: string | null,"id": string,"role"?: Database["public"]['Enums']["user_role"],"trust_score"?: number
                  }
                  Update: {
                    "auth_provider"?: string | null,"created_at"?: string,"email"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["user_role"],"trust_score"?: number
                  }
                  Relationships: [
                    
                  ]
                },"vote_signals": {
                  Row: {
                    "created_at": string,"fingerprint_hash": string | null,"ip_country": string | null,"is_vpn": boolean | null,"location_check": boolean | null,"timezone_match": boolean | null,"vote_id": string
                  }
                  Insert: {
                    "created_at"?: string,"fingerprint_hash"?: string | null,"ip_country"?: string | null,"is_vpn"?: boolean | null,"location_check"?: boolean | null,"timezone_match"?: boolean | null,"vote_id": string
                  }
                  Update: {
                    "created_at"?: string,"fingerprint_hash"?: string | null,"ip_country"?: string | null,"is_vpn"?: boolean | null,"location_check"?: boolean | null,"timezone_match"?: boolean | null,"vote_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vote_signals_vote_id_fkey"
      columns: ["vote_id"]
isOneToOne: true
      referencedRelation: "votes"
      referencedColumns: ["id"]
    }
                  ]
                },"votes": {
                  Row: {
                    "changed_at": string | null,"choice": Database["public"]['Enums']["vote_choice"],"counted": boolean,"created_at": string,"guess_pct_a": number | null,"id": string,"reason_tags": (string)[],"topic_id": string,"user_id": string
                  }
                  Insert: {
                    "changed_at"?: string | null,"choice": Database["public"]['Enums']["vote_choice"],"counted"?: boolean,"created_at"?: string,"guess_pct_a"?: number | null,"id"?: string,"reason_tags"?: (string)[],"topic_id": string,"user_id": string
                  }
                  Update: {
                    "changed_at"?: string | null,"choice"?: Database["public"]['Enums']["vote_choice"],"counted"?: boolean,"created_at"?: string,"guess_pct_a"?: number | null,"id"?: string,"reason_tags"?: (string)[],"topic_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "votes_topic_id_fkey"
      columns: ["topic_id"]
isOneToOne: false
      referencedRelation: "topics"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "votes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "cast_vote":
{ Args: { "p_choice": Database["public"]['Enums']["vote_choice"],"p_topic_id": string }; Returns: Json
                           },
"is_moderator":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"submit_guess":
{ Args: { "p_guess_pct_a": number,"p_reason_tags"?: (string)[],"p_topic_id": string }; Returns: undefined
                           },
"topic_results":
{ Args: { "p_topic_id": string }; Returns: Json
                           },
"trending_topics":
{ Args: { "p_limit"?: number }; Returns: {
              "recent_votes": number,"topic_id": string
            }[]
                           },
"voting_now":
{ Args: Record<PropertyKey, never>; Returns: number
                           }
          }
          Enums: {
            "age_band": "18-24"|"25-34"|"35-44"|"45-54"|"55+","gender": "male"|"female","moderator_decision": "approved"|"edited_approved"|"rejected","subscription_plan": "peek"|"researcher","subscription_status": "active"|"past_due"|"canceled","topic_category": "social"|"entertainment"|"gaming"|"sports"|"economy"|"technology"|"other","topic_status": "pending"|"open"|"closed"|"archived"|"rejected","user_role": "voter"|"moderator"|"researcher","vote_choice": "a"|"b"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "age_band": ["18-24", "25-34", "35-44", "45-54", "55+"],"gender": ["male", "female"],"moderator_decision": ["approved", "edited_approved", "rejected"],"subscription_plan": ["peek", "researcher"],"subscription_status": ["active", "past_due", "canceled"],"topic_category": ["social", "entertainment", "gaming", "sports", "economy", "technology", "other"],"topic_status": ["pending", "open", "closed", "archived", "rejected"],"user_role": ["voter", "moderator", "researcher"],"vote_choice": ["a", "b"]
          }
        }
} as const
