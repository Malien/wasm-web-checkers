export default async function measureWithResult<T>(block: () => T | Promise<T>) {
    const start = performance.now()
    const res = await block()
    return [res, performance.now() - start] as const
}
