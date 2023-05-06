import { Player } from "./player";

export interface ChatMessage {
    sender: Player;
    text: string;
}
