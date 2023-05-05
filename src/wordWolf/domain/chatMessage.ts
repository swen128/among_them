import { Player } from "../state";

export interface ChatMessage {
    sender: Player;
    text: string;
}
