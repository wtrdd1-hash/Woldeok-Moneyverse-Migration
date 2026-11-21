package com.moneyverse.api.domain.tools;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Pure, source-matched calculator math for Spring-rendered frontend.
 * This is an illustrative simulation, not a stock quote, tax determination,
 * posting to the real ledger, or certified investment outcome.
 */
public final class SpringCalculatorMath {
    private SpringCalculatorMath() {}

    public record Metric(String key, String en, String ko, String value, String suffix) {}
    public record Milestone(int year, String contributed, String projected, String interest) {}
    public record Result(List<Metric> metrics, List<Milestone> yearly, String descriptionEn, String descriptionKo) {}
    public record Input(Map<String,String> values, Result result, String error) {
        public boolean valid() { return error == null; }
    }

    public static Input compound(Map<String,String> query) {
        Map<String,String> values = defaults(Map.of("principal", "100000", "monthlyDeposit", "10000", "annualRate", "8.5", "years", "3", "frequency", "monthly"), query);
        try {
            BigDecimal principal = number(values, "principal", new BigDecimal("1000000000000"));
            BigDecimal monthly = number(values, "monthlyDeposit", new BigDecimal("1000000000000"));
            BigDecimal rate = number(values, "annualRate", new BigDecimal("100"));
            int years = number(values, "years", new BigDecimal("50")).intValueExact();
            if (years < 1) throw new IllegalArgumentException("Years must be between 1 and 50.");
            String frequency = values.get("frequency");
            if (!List.of("daily", "monthly", "annually").contains(frequency))
                throw new IllegalArgumentException("Invalid compounding frequency.");
            int n = switch (frequency) { case "daily" -> 365; case "annually" -> 1; default -> 12; };
            double r = rate.doubleValue() / 100.0;
            double monthlyAmount = monthly.doubleValue();
            double p = principal.doubleValue();
            double growth = 1 + r/n;
            int months = years * 12;
            double total = p * Math.pow(growth, n*years);
            for (int m=1; m<=months; ++m)
                total += monthlyAmount * Math.pow(growth, ((months - m)*n)/12.0);
            BigDecimal finalValue = rounded(total);
            BigDecimal contributed = principal.add(monthly.multiply(BigDecimal.valueOf(months))).setScale(0,RoundingMode.HALF_UP);
            BigDecimal interest = finalValue.subtract(contributed).max(BigDecimal.ZERO);
            BigDecimal simple = rounded(p*r*years + (monthlyAmount*months*r*years)/2.0);
            BigDecimal bonus = interest.subtract(simple).max(BigDecimal.ZERO);
            List<Milestone> yearly = new ArrayList<>();
            for (int y=1;y<=years;y++) {
                int count = y*12;
                double v=p*Math.pow(growth,n*y);
                for (int m=1;m<=count;m++)v+=monthlyAmount*Math.pow(growth,((count-m)*n)/12.0);
                BigDecimal amount=rounded(v);
                BigDecimal invested=principal.add(monthly.multiply(BigDecimal.valueOf(count))).setScale(0,RoundingMode.HALF_UP);
                yearly.add(new Milestone(y,format(invested),format(amount),format(amount.subtract(invested).max(BigDecimal.ZERO))));
            }
            List<Metric> metrics=List.of(
                    new Metric("total-final","Projected balance","예상 최종 자산",format(finalValue),""),
                    new Metric("total-deposit","Total contributed","총 납입금",format(contributed),""),
                    new Metric("total-interest","Projected interest","예상 복리 수익",format(interest),""),
                    new Metric("simple-interest","Simple interest comparison","단리 비교 수익",format(simple),""),
                    new Metric("compound-bonus","Compound advantage","복리 추가 이익",format(bonus),""));
            return new Input(Map.copyOf(values),new Result(metrics,List.copyOf(yearly),
                    "Assumes a fixed annual rate and end-of-month deposits; this is a mathematical projection, not a return guarantee.",
                    "연이율 고정·매월 말 납입 가정의 수학적 예측값이며 실제 수익을 보장하지 않습니다."),null);
        } catch (Exception e) { return invalid(values,e); }
    }

    public static Input stock(Map<String,String> query) {
        Map<String,String> values = defaults(Map.of("initialPrice","50","initialQuantity","100","additionalPrice","40","additionalQuantity","150","targetProfitPercent","15","feeRate","0.05"),query);
        try {
            BigDecimal p1=number(values,"initialPrice",new BigDecimal("1000000000"));
            BigDecimal q1=number(values,"initialQuantity",new BigDecimal("100000000"));
            BigDecimal p2=number(values,"additionalPrice",new BigDecimal("1000000000"));
            BigDecimal q2=number(values,"additionalQuantity",new BigDecimal("100000000"));
            BigDecimal target=number(values,"targetProfitPercent",new BigDecimal("1000"));
            BigDecimal fee=number(values,"feeRate",new BigDecimal("50"));
            BigDecimal qty=q1.add(q2);
            BigDecimal cost=p1.multiply(q1).add(p2.multiply(q2));
            BigDecimal average=qty.signum()==0 ? BigDecimal.ZERO : cost.divide(qty,2,RoundingMode.HALF_UP);
            BigDecimal difference=p1.signum()==0 ? BigDecimal.ZERO :
                    average.subtract(p1).multiply(BigDecimal.valueOf(100)).divide(p1,2,RoundingMode.HALF_UP);
            BigDecimal feeFraction=fee.movePointLeft(2);
            BigDecimal selling=qty.signum()==0 ? BigDecimal.ZERO :
                    cost.multiply(BigDecimal.ONE.add(target.movePointLeft(2)))
                            .divide(qty.multiply(BigDecimal.ONE.subtract(feeFraction)),2,RoundingMode.HALF_UP);
            BigDecimal exit=selling.multiply(qty).multiply(BigDecimal.ONE.subtract(feeFraction))
                    .setScale(0,RoundingMode.HALF_UP);
            BigDecimal profit=exit.subtract(cost).setScale(0,RoundingMode.HALF_UP);
            List<Metric> metrics=List.of(
                    new Metric("average","New average price","변경 후 평균 매입가",format(average),""),
                    new Metric("quantity","Total shares","총 주식 수",format(qty),""),
                    new Metric("cost","Total simulated cost","총 가상 투자원가",format(cost),""),
                    new Metric("price-change","Average change vs initial","초기 매수가 대비 평균 변동",format(difference),"%"),
                    new Metric("target-price","Target sale price","목표 매도가",format(selling),""),
                    new Metric("profit","Estimated net profit","예상 수수료 차감 수익",format(profit),""));
            return new Input(Map.copyOf(values),new Result(metrics,List.of(),
                    "This is a cost-basis simulation from your inputs. It does not place orders or fetch live quotes.",
                    "입력값에 따른 원가 시뮬레이션입니다. 실제 주문·시세 조회·정산을 하지 않습니다."),null);
        } catch (Exception e) { return invalid(values,e); }
    }

    private static Map<String,String> defaults(Map<String,String> defaults,Map<String,String> query) {
        Map<String,String> merged=new LinkedHashMap<>(defaults);
        for (String key:defaults.keySet()) {
            if (query.containsKey(key)) merged.put(key,query.get(key));
        }
        return merged;
    }

    private static BigDecimal number(Map<String,String> input,String key,BigDecimal limit) {
        String raw=input.get(key);
        if (raw==null||raw.length()>30||!raw.matches("^(?:0|[1-9][0-9]{0,14})(?:\\.[0-9]{1,4})?$"))
            throw new IllegalArgumentException("Enter a non-negative numeric value for " + key + ".");
        BigDecimal parsed=new BigDecimal(raw);
        if(parsed.compareTo(limit)>0)throw new IllegalArgumentException("Value exceeds the supported range: " + key + ".");
        return parsed;
    }

    private static BigDecimal rounded(double value) {
        if(!Double.isFinite(value)||value<0)throw new IllegalArgumentException("Projection is outside the supported range.");
        return BigDecimal.valueOf(value).setScale(0,RoundingMode.HALF_UP);
    }

    private static String format(BigDecimal value) {
        DecimalFormat decimal=new DecimalFormat("#,##0.##",DecimalFormatSymbols.getInstance(Locale.US));
        decimal.setRoundingMode(RoundingMode.HALF_UP);
        return decimal.format(value);
    }

    private static Input invalid(Map<String,String> values,Exception error) {
        String message=error instanceof ArithmeticException ? "Calculation exceeds the supported range." : error.getMessage();
        if (message==null||message.length()>150)message="Check the input values.";
        return new Input(Map.copyOf(values),new Result(List.of(),List.of(),"",""),message);
    }
}
