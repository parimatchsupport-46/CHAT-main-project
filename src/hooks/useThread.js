import { useCallback, useEffect, useMemo, useState } from "react";

function reactionListFor(reactions, uid) {
    if (!reactions || !uid) return [];
    const value = reactions[uid];
    return Array.isArray(value) ? value : value ? [value] : [];
}

/** Live chat document + messages for one private conversation. */
export function useThread(service, uid, otherUid, options = {}) {
    const messageDate = options.messageDate || null;
    const messageLimit = options.messageLimit;
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    // Optimistic reactions: { [messageId]: { uid, reactions: [...] } }.
    // They are overlaid on top of the live snapshot until Firestore confirms
    // the write, so a tap is visible on the very next frame.
    const [reactionPatches, setReactionPatches] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    /**
     * Shows a reaction immediately, before Firestore confirms it. Only the
     * reacting user's own entry is overlaid, so everyone else's reactions
     * keep coming straight from the live snapshot.
     */
    const applyReactionPatch = useCallback((messageId, reactorUid, reactionMap) => {
        if (!messageId || !reactorUid) return;
        setReactionPatches((current) => ({
            ...current,
            [messageId]: {
                uid: reactorUid,
                reactions: reactionListFor(reactionMap, reactorUid)
            }
        }));
    }, []);

    const clearReactionPatch = useCallback((messageId) => {
        setReactionPatches((current) => {
            if (!(messageId in current)) return current;
            const next = { ...current };
            delete next[messageId];
            return next;
        });
    }, []);

    const visibleMessages = useMemo(() => {
        const patchedIds = Object.keys(reactionPatches);
        if (!patchedIds.length) return messages;
        return messages.map((message) => {
            const patch = reactionPatches[message.id];
            if (!patch) return message;
            const nextReactions = { ...message.reactions };
            if (patch.reactions.length) nextReactions[patch.uid] = patch.reactions;
            else delete nextReactions[patch.uid];
            return { ...message, reactions: nextReactions };
        });
    }, [messages, reactionPatches]);

    // Drop a patch as soon as the live snapshot already contains it.
    useEffect(() => {
        if (!Object.keys(reactionPatches).length) return;
        setReactionPatches((current) => {
            let changed = false;
            const next = { ...current };
            for (const [messageId, patch] of Object.entries(current)) {
                const message = messages.find((item) => item.id === messageId);
                if (!message) continue;
                const live = reactionListFor(message.reactions, patch.uid);
                if (JSON.stringify(live) === JSON.stringify(patch.reactions)) {
                    delete next[messageId];
                    changed = true;
                }
            }
            return changed ? next : current;
        });
    }, [messages, reactionPatches]);

    useEffect(() => {
        if (!uid || !otherUid) {
            setLoading(false);
            return undefined;
        }

        let active = true;
        let chatReady = false;
        let messagesReady = false;
        setChat(null);
        setMessages([]);
        setReactionPatches({});
        setLoading(true);
        setError("");

        const finish = () => {
            if (active && chatReady && messagesReady) setLoading(false);
        };
        const fail = (nextError) => {
            if (!active) return;
            setError(nextError?.message || "Could not load this conversation.");
            setLoading(false);
        };

        const stopChat = service.subscribeChat(
            uid,
            otherUid,
            (next) => {
                if (!active) return;
                setChat(next);
                chatReady = true;
                finish();
            },
            fail
        );

        const stopMessages = service.subscribeMessages(
            uid,
            otherUid,
            (list) => {
                if (!active) return;
                setMessages(list);
                messagesReady = true;
                finish();
            },
            fail,
            { date: messageDate, limit: messageLimit }
        );

        return () => {
            active = false;
            stopChat();
            stopMessages();
        };
    }, [service, uid, otherUid, attempt, messageDate, messageLimit]);

    return {
        chat,
        messages: visibleMessages,
        loading,
        error,
        retry,
        applyReactionPatch,
        clearReactionPatch
    };
}
