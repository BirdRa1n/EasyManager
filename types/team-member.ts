export default interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: string;
    permissions: string[] | null;
    joined_at: string;
}