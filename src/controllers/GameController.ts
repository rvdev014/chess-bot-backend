import {Request, Response} from "express"

class GameController {
    public async index(req: Request, res: Response): Promise<Response> {
        return res.json({message: 'Hello World'})
    }

    public async searchOpponent(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.query.userId
            if (!userId) {
                return res.status(400).json({message: 'User ID is required'})
            }

            return res.json({message: 'Success'})
        } catch (e: any) {
            return res.status(500).json({message: e.message})
        }
    }

    public async removeFromQueue(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.query.userId
            if (!userId) {
                return res.status(400).json({message: 'User ID is required'})
            }

            return res.json({message: 'Success'})
        } catch (e: any) {
            return res.status(500).json({message: e.message})
        }
    }
}

export default new GameController()