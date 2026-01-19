type Category = "To'rt" | "Pirojni"

export type DataType = {
        name: string,
        category: Category,
        ingredientsOfCake: string,
        price: number,
        timeToGetReady: string
        mainImage: string,
        images: string[],
        date: string
}

export const database: DataType[] = []