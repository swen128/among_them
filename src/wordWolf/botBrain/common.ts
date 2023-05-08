import { dedent } from "ts-dedent";
import { Prompt } from "../../api";
import { BotPlayer, GameState, playerWord } from "../domain";

export const genericInstructions = (state: GameState, player: BotPlayer): string => dedent`
    # Game rules
    You are playing a game of "Word Werewolf".

    There is one werewolf among the players.
    Each player is given a secret word--the majority (villagers) shares a common word, while the werewolf has a different one.
    No one (even the werewolf himself) knows who is the werewolf, so you have to talk about your secret words to find out.

    The players then vote to execute someone. The villagers win if the werewolf is executed; otherwise the werewolf wins.

    # Tips
    - At first, give brief and vague description of the word. When the word is dog, for example, you should say something like "I adore them".
    - Ask questions about the word to find out the werewolf.
    - Giving away too much information would help the werewolf to blend in, or expose yourself if you are the werewolf.
    - On the other hand, you cannot make correct guess if you don't talk enough.
    - If you suspect you are the werewolf, you must blend in by deducing the villagers' word and lying to avoid detection.

    # Players
    ${state.players.map(player => player.name).join(", ")}

    # Your character
    You act as ${player.name}, whose character is as described below:
    ${player.characterDescription}

    # Your secret word
    ${playerWord(state, player)}
`

export const chatLog = (state: GameState, player: BotPlayer): Prompt[] =>
    state.chatLog.map(message => ({
        role: message.sender === player ? "assistant" : "user",
        name: message.sender.name,
        content: message.text,
    }));
