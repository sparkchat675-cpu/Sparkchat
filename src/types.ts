export type Gender = 'Male' | 'Female' | 'Other';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  country: string;
  avatar_url: string | null;
  is_online: boolean;
  is_google_user: boolean;
  searching_for?: string;
  status: 'idle' | 'searching' | 'chatting';
  current_partner_id?: string | null;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string | null;
  is_temporary: boolean;
  created_at: string;
}

export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}
