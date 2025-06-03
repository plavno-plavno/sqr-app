export function quadraticRank(input: number) {
    const value = input * input;

    if (value > 16) {
        return 6;
    }

    // Ранжируем каждые 25 единиц (25 → +1, 50 → +2, 75 → +3, 100 → +4)
    // на какой секунде трешхолд увеличивается
    return Math.floor(value / 2);
}