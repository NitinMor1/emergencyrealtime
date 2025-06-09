export function getPatientUserName(arg: string | undefined | null): string {
    const args: string[] = arg?.split("@") ?? [];
    var val = args[0];
    const val2 = val.replace(" ", "_")
    const username = val2.toLowerCase() + "@medoc";
    return username;
}