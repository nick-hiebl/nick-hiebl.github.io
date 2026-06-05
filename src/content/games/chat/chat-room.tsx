import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import './style.css'

const useSocket = () => {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        setSocket(io('https://api.nick-h.net', { query: { name: 'Nick2' }}))
    }, [])

    return socket
}

type Message = {
    timestamp: string
    message: string
    author: string
}

type LocalMessage = Message & { isError?: boolean }

const MessageComponent = ({ author, message, timestamp, isError = false }: LocalMessage) => {
    return (
        <li className="message" data-error={isError}>
            <span>[{new Date(timestamp).toLocaleTimeString('en-UK', { timeStyle: 'short' })}]</span>
            {' '}
            <span>&lt;@{author.slice(0, 40)}&gt;</span>
            {' '}
            <span>{message}</span>
        </li>
    )
}

export const ChatRoom = () => {
    const socket = useSocket()
    const chatWindow = useRef<HTMLElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [messages, setMessages] = useState<LocalMessage[]>([])
    const [input, setInput] = useState('')

    useEffect(() => {
        if (chatWindow.current) {
            chatWindow.current.scrollTo({
                left: 0,
                top: chatWindow.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [messages])

    useEffect(() => {
        if (!socket) {
            return
        }

        const addMessages = (messages: LocalMessage[]) => {
            setMessages(current => current.concat(messages))
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
    }, [socket])

    const send = () => {
        if (!socket || !input.trim()) {
            return
        }

        socket.emit('message', { message: input })
        setMessages(current => current.concat({
            message: input.trim(),
            author: socket.id ?? 'Me',
            timestamp: new Date().toISOString(),
        }))
        setInput('')
    }

    return (
        <section>
            <h1>Chat!</h1>
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
