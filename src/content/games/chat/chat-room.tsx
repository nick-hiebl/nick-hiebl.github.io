import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import './style.css'

const defaultName = () => `User ${Math.floor(Math.random() * 1000)}`

const loadName = () => {
    const loadedName = localStorage.getItem('user-name')

    if (loadedName) {
        return loadedName
    }

    const newName = defaultName()
    localStorage.setItem('user-name', newName)
    return newName
}

const BACKEND_BASE = 'https://api.nick-h.net'

const useSocket = (lobbyCode: string) => {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        const name = loadName()

        setSocket(io(BACKEND_BASE, { query: { name, activity: 'chat', code: lobbyCode } }))
    }, [lobbyCode])

    return socket
}

type Message = {
    timestamp: string
    message: string
    author: string
}

type LocalMessage = Message & { isError?: boolean; isMe?: boolean }

const MessageComponent = ({ author, message, timestamp, isError = false, isMe = false }: LocalMessage) => {
    return (
        <li className="message" data-error={isError} data-me={isMe}>
            <span>[{new Date(timestamp).toLocaleTimeString('en-UK', { timeStyle: 'short' })}]</span>
            {' '}
            <span className="author">&lt;@{author.slice(0, 40)}&gt;</span>
            {' '}
            <span>{message}</span>
        </li>
    )
}

type LocalPartialMessage = Omit<LocalMessage, 'timestamp'> & Partial<Pick<LocalMessage, 'timestamp'>>

export const ChatRoom = () => {
    const [lobby, setLobby] = useState<string | undefined>(document.location.hash.slice(1) || undefined)
    const [lobbyInvalid, setLobbyInvalid] = useState(false)

    useEffect(() => {
        const onHashChange = () => {
            setLobby(document.location.hash.slice(1) || undefined)
            console.log('Hash changed')
        }

        addEventListener('hashchange', onHashChange)

        return () => {
            removeEventListener('hashchange', onHashChange)
        }
    }, [])

    const onLobbyNotFound = useCallback(() => {
        setLobbyInvalid(true)
    }, [])

    if (lobbyInvalid) {
        return (
            <section>
                <h1>Chat!</h1>
                <p>Lobby is invalid: {lobby}</p>
                <button
                    onClick={() => {
                        setLobby(undefined)
                        setLobbyInvalid(false)
                        window.location.hash = ''
                    }}
                >
                    Back to home
                </button>
            </section>
        )
    }

    if (!lobby) {
        return (
            <section>
                <h1>Chat!</h1>
                <button
                    onClick={async () => {
                        try {
                            const lobbyDetails = await fetch(`${BACKEND_BASE}/create`, {
                                method: 'POST',
                                body: JSON.stringify({ activity: 'chat' }),
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }).then(res => res.json())

                            setLobby(lobbyDetails.code)
                            document.location.hash = lobbyDetails.code
                        } catch {
                            console.error('Failed to create lobby')
                        }
                    }}
                >
                    Create lobby
                </button>
            </section>
        )
    }

    return (
        <ChatRoomInner code={lobby} onLobbyNotFound={onLobbyNotFound} />
    )
}

type ChatRoomInnerProps = {
    code: string
    onLobbyNotFound: () => void
}

export const ChatRoomInner = ({ code, onLobbyNotFound }: ChatRoomInnerProps) => {
    const socket = useSocket(code)
    const chatWindow = useRef<HTMLElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [totalFailure, setTotalFailure] = useState(false)

    const [messages, setMessages] = useState<LocalMessage[]>([])
    const [input, setInput] = useState('')

    useEffect(() => {
        setMessages([])
    }, [code])

    useEffect(() => {
        if (chatWindow.current) {
            chatWindow.current.scrollTo({
                left: 0,
                top: chatWindow.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [messages])

    const addMessages = useCallback((messages: LocalPartialMessage[]) => {
        setMessages(current => current.concat(
            messages.map(message =>
                ({ ...message, timestamp: message.timestamp ?? new Date().toISOString() })
            )
        ))
    }, [])

    useEffect(() => {
        if (!socket) {
            return
        }

        const onSendMessages = (args: { messages: Message[]; initial?: boolean }) => {
            if (args.initial) {
                setMessages(current => {
                    const messages = current.filter(c => c.isError).concat(args.messages)

                    messages.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))

                    return messages
                })
            } else {
                addMessages(args.messages)
            }
        }

        socket.on('connect_error', () => setTotalFailure(true))

        socket.on('not-found', () => {
            onLobbyNotFound()
        })

        socket.on('send-messages', onSendMessages)

        socket.on('disconnect', () => {
            addMessages([{
                timestamp: new Date().toISOString(),
                author: 'Server',
                message: 'You have disconnected',
                isError: true,
            }])
        })

        socket.on('connect', () => {
            setTotalFailure(false)
            addMessages([{
                timestamp: new Date().toISOString(),
                author: 'Server',
                message: 'You have connected',
                isError: true,
            }])
        })

        return () => {
            socket.off('send-messages', onSendMessages)
        }
    }, [addMessages, onLobbyNotFound, socket])

    const send = () => {
        if (!socket || !input.trim()) {
            return
        }

        if (input.startsWith('/name ')) {
            const newName = input.slice('/name '.length).trim() || 'cheater'

            socket.emit('set-name', { name: newName })

            localStorage.setItem('user-name', newName)

            addMessages([{
                message: `Your name is now: ${newName}`,
                author: 'Server',
            }])
        } else if (input.startsWith('/help')) {
            addMessages([{
                message: '/name <name> to change your name',
                author: 'Server',
                isError: true,
            }])
        } else if (input.startsWith('/')) {
            addMessages([{
                message: 'Unrecognised command',
                author: 'Server',
                isError: true,
            }])
        } else {
            socket.emit('message', { message: input })
            addMessages([{
                message: input.trim(),
                author: loadName(),
                isMe: true,
            }])
        }

        setInput('')
    }

    return (
        <section>
            <h1>Chat!</h1>
            {totalFailure && (
                <div>Could not connect. Server may be down currently.</div>
            )}
            <div className="message-box" ref={e => { chatWindow.current = e }}>
                <ul>
                    {messages.map((message, index) => (
                        <MessageComponent key={index} {...message} />
                    ))}
                </ul>
            </div>
            <div className="input-row">
                <div
                    className="input-bar"
                    onClick={() => {
                        inputRef.current?.focus()
                    }}
                >
                    <input
                        disabled={totalFailure}
                        autoComplete="off"
                        type="text"
                        id="chat-input"
                        name="chat-input"
                        value={input}
                        onChange={e => setInput(e.currentTarget.value)}
                        ref={e => { inputRef.current = e }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                send()
                            }
                        }}
                    />
                    <button
                        disabled={totalFailure}
                        aria-label="Send"
                        onClick={e => {
                            send()
                            e.stopPropagation()
                        }}
                    >
                        ↑
                    </button>
                </div>
            </div>
        </section>
    )
}
