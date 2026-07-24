'use client';
import CountUp from "react-countup"

function AnimatedCounter({ amount }: { amount: number }) {
    return (
        <div className="w-full text-center">
            <CountUp
                decimals={2}
                decimal="."
                end={amount}
                duration={1.5}
                prefix='$'
            />
        </div>
    )
}

export default AnimatedCounter