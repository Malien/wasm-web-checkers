import { EngineType, GameLogicEngine } from "./common"
import { JSGameLogic } from "./js"
import { RSGameLogic } from "./rs"
import { Disposable } from "./util"

export default async function initEngine(type: EngineType): Promise<GameLogicEngine & Disposable> {
    switch (type) {
        case "js":
            return new JSGameLogic()
        case "swipl": {
            const { SWIPLGameLogic } = await import("./swipl/game")
            return new SWIPLGameLogic()
        }
        case "rs":
            return new RSGameLogic()
    }
}